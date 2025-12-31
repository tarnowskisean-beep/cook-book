'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import openai from '@/lib/openai';

// AI Generation Action
export async function generateScript(recipeId: string, platforms: string[]) {
    try {
        // 1. Fetch Context with Project -> Persona relation
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
                project: {
                    include: {
                        persona: true
                    }
                }
            }
        });

        if (!recipe) throw new Error("Recipe not found");

        // 2. Determine Persona (Project default -> Global default -> Fallback)
        let persona = recipe.project?.persona;

        if (!persona) {
            persona = await prisma.persona.findFirst();
        }

        const personaName = persona?.name || "Dom";
        const personality = persona?.description || "A helpful AI cooking assistant.";
        const visuals = persona?.visualDescription || "A friendly digital avatar.";

        // 3. Construct Prompt with Text Descriptions
        const systemPrompt = `
            You are ${personaName}.
            
            YOUR PERSONALITY:
            ${personality}
            
            YOUR VISUAL STYLE:
            ${visuals}

            GOAL: Write a viral short-form video script (max 45s) for the provided recipe.
            Include [VISUAL] cues in brackets adhering to your visual style.
        `;

        const userPrompt = `
            Recipe: ${recipe.name}
            Description: ${recipe.description}
            Ingredients: ${recipe.ingredients}
            Instructions: ${recipe.instructions}
            Origin Story: ${recipe.originStory || "No backstory provided"}
            Target Platforms: ${platforms.join(', ')}

            Write the script now.
        `;

        // 4. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const script = completion.choices[0].message.content;
        return { success: true, script };
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

// DEPRECATED: Old numeric setting actions removed in favor of text-based Personas.
// See src/app/personas/actions.ts for new logic.
