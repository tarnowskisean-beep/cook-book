'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import openai from '@/lib/openai';

// AI Generation Action
export async function generateScript(recipeId: string, platforms: string[]) {
    try {
        // 1. Fetch Context
        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
        const persona = await prisma.persona.findFirst();

        if (!recipe) throw new Error("Recipe not found");

        // Default persona if not set or missing traits
        const style = (persona && persona.personalityTraits && persona.voiceSettings) ? {
            voice: JSON.parse(persona.voiceSettings).voice,
            sass: JSON.parse(persona.personalityTraits).sassLevel,
            energy: JSON.parse(persona.personalityTraits).energyLevel,
            nostalgia: JSON.parse(persona.personalityTraits).nostalgiaLevel
        } : { voice: "Generic", sass: 5, energy: 5, nostalgia: 5 };

        // Dynamic Prompt Injection
        let behavioralInstructions = "";

        if (style.sass > 7) {
            behavioralInstructions += "- CRITICAL: Actively roast the viewer. Mock the simplicity of the recipe. Be ruthless.\n";
        } else if (style.sass < 4) {
            behavioralInstructions += "- Be very polite and encouraging. Treat the viewer like a beginner.\n";
        }

        if (style.energy > 7) {
            behavioralInstructions += "- CRITICAL: HYPE IT UP. Use short, punchy sentences. USE CAPS for emphasis. This is the most exciting thing ever.\n";
        } else if (style.energy < 4) {
            behavioralInstructions += "- Speak in a monotone, bored voice. You are tired of cooking. Sigh often.\n";
        }

        if (style.nostalgia > 7) {
            behavioralInstructions += `- STRATEGY: Focus on MEMORY and ORIGIN. Tell this specific story: "${recipe.originStory || 'Family Tradition'}". Lament modern shortcuts.\n`;
        }

        // 2. Construct Prompt
        const systemPrompt = `
            You are ${persona?.name || "Dom"}, a digitized chef persona.
            Voice: ${style.voice}
            
            Your Core Personality Traits (1-10):
            - Sass/Roasting: ${style.sass}
            - Energy/Hype: ${style.energy}
            - Nostalgia: ${style.nostalgia}

            STRICT BEHAVIORAL INSTRUCTIONS:
            ${behavioralInstructions}

            Your goal is to write a viral optimization script for a cooking video.
            The script should be under 45 seconds when read aloud.
            Include [VISUAL] cues in brackets.
        `;

        const userPrompt = `
            Recipe: ${recipe.name}
            Description: ${recipe.description}
            Ingredients: ${recipe.ingredients}
            Instructions: ${recipe.instructions}
            Origin Story: ${recipe.originStory || "No backstory provided"}
            Target Platforms: ${platforms.join(', ')}

            Task: Write a script that captures attention immediately.
            Constraint: Identify one specific ingredient or step to focus your personality on.
        `;

        // 3. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const script = completion.choices[0].message.content;
        return { success: true, script };

    } catch (error) {
        console.error("AI Generation Failed:", error);
        return { success: false, error: "Failed to generate script" };
    }
}

export async function saveContent(recipeId: string, type: string, url: string, platforms: string[], script: string) {
    try {
        const createdContents = [];

        // Batch create content for each platform
        for (const platform of platforms) {
            const content = await prisma.generatedContent.create({
                data: {
                    recipeId,
                    type,
                    url,
                    platform,
                    status: 'DRAFT',
                    performanceMetrics: JSON.stringify({ script }) // Storing script in metrics for now
                }
            });
            createdContents.push(content);
        }

        return { success: true, data: createdContents };
    } catch (error) {
        console.error("Failed to save content:", error);
        return { success: false, error: "Failed to save content" };
    }
}

export async function schedulePost(contentId: string | string[], scheduledTime: string) { // receiving ISO string
    try {
        const ids = Array.isArray(contentId) ? contentId : [contentId];

        for (const id of ids) {
            await prisma.post.create({
                data: {
                    contentId: id,
                    scheduledTime: new Date(scheduledTime),
                    status: 'SCHEDULED'
                }
            });

            // Update content status
            await prisma.generatedContent.update({
                where: { id: id },
                data: { status: 'SCHEDULED' }
            });
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to schedule post:", error);
        return { success: false, error: "Failed to schedule post" };
    }
}

export async function toggleConnection(platform: string) {
    try {
        const existing = await prisma.socialAccount.findFirst({
            where: { platform }
        });

        if (existing) {
            await prisma.socialAccount.delete({
                where: { id: existing.id }
            });
        } else {
            // Connect
            await prisma.socialAccount.create({
                data: {
                    platform,
                    credentials: 'mock_token_' + Math.random().toString(36).substring(7),
                    status: 'CONNECTED'
                }
            });
        }

        revalidatePath('/connections');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle connection:", error);
        return { success: false, error: "Failed to update connection" };
    }
}

export async function createProject(formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        if (!title) {
            return { success: false, error: "Title is required" };
        }

        const personaId = formData.get('personaId') as string;

        const project = await prisma.project.create({
            data: {
                title,
                description,
                personaId: personaId || null,
                // publicationDate is optional
            }
        });

        revalidatePath('/projects');
        return { success: true, projectId: project.id };
    } catch (error: any) {
        console.error("Failed to create project:", error);
        return { success: false, error: "Failed to create project: " + (error.message || "Unknown error") };
    }
}

export async function createRecipe(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const originStory = formData.get('originStory') as string;
        const projectId = formData.get('projectId') as string;
        const ingredientsRaw = formData.get('ingredients') as string;
        const instructionsRaw = formData.get('instructions') as string;

        if (!name || !projectId) {
            return { success: false, error: "Name and Project are required" };
        }

        // Parse ingredients and instructions from newline-separated text (safely)
        const ingredients = JSON.stringify(
            (ingredientsRaw || '').split('\n').map(s => s.trim()).filter(Boolean)
        );
        const instructions = JSON.stringify(
            (instructionsRaw || '').split('\n').map(s => s.trim()).filter(Boolean)
        );

        const recipe = await prisma.recipe.create({
            data: {
                name,
                description,
                projectId,
                ingredients,
                instructions,
                originStory,
                images: '[]', // Default empty images
                source: 'Manual Entry'
            }
        });

        revalidatePath('/recipes');
        return { success: true, recipeId: recipe.id };
    } catch (error: any) {
        console.error("Failed to create recipe:", error);
        return { success: false, error: "Failed to create recipe: " + (error.message || "Unknown error") };
    }
}

export async function updateSettings(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const voice = formData.get('voice') as string;

        // Autopilot
        const autopilot = {
            enabled: formData.get('autopilotEnabled') === 'on',
            postsPerDay: Number(formData.get('postsPerDay')),
            requireApproval: formData.get('requireApproval') === 'on'
        };

        // Personality
        const personality = {
            sassLevel: Number(formData.get('sassLevel')),
            energyLevel: Number(formData.get('energyLevel')),
            nostalgiaLevel: Number(formData.get('nostalgiaLevel'))
        };

        const existing = await prisma.persona.findFirst();

        if (existing) {
            await prisma.persona.update({
                where: { id: existing.id },
                data: {
                    name,
                    voiceSettings: JSON.stringify({ voice }),
                    autopilotSettings: JSON.stringify(autopilot),
                    personalityTraits: JSON.stringify(personality)
                }
            });
        } else {
            await prisma.persona.create({
                data: {
                    name: name || 'Dom',
                    voiceSettings: JSON.stringify({ voice }),
                    autopilotSettings: JSON.stringify(autopilot),
                    personalityTraits: JSON.stringify(personality)
                }
            });
        }

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update settings" };
    }
}

export async function optimizePersona() {
    try {
        const persona = await prisma.persona.findFirst();
        if (!persona) return { success: false, error: "No persona found" };

        const currentTraits = persona.personalityTraits ? JSON.parse(persona.personalityTraits) : { sassLevel: 5, energyLevel: 5, nostalgiaLevel: 5 };

        // SIMULATION: In a real app, we would fetch:
        // const successfulPosts = await prisma.generatedContent.findMany({ where: { views: { gt: 10000 } } });
        // And analyze their sentiment/style.

        // For now, we simulate a "Learning Step"
        // Let's assume the algorithm found that "Higher Energy" leads to better retention.
        const newTraits = {
            sassLevel: Math.min(10, Math.max(1, currentTraits.sassLevel + (Math.random() > 0.5 ? 1 : -1))), // Random nudge
            energyLevel: Math.min(10, Math.max(1, currentTraits.energyLevel + 1)), // Bias towards higher energy
            nostalgiaLevel: Math.min(10, Math.max(1, currentTraits.nostalgiaLevel + (Math.random() > 0.5 ? 1 : -1)))
        };

        await prisma.persona.update({
            where: { id: persona.id },
            data: {
                personalityTraits: JSON.stringify(newTraits)
            }
        });

        revalidatePath('/settings');
        return { success: true, newTraits };

    } catch (error) {
        console.error("Optimization failed:", error);
        return { success: false, error: "Optimization failed" };
    }
}
