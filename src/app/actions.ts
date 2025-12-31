'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import openai from '@/lib/openai';
import { generateImage, submitVideo, checkVideoStatus } from '@/lib/krea';

// AI Generation Action
// AI Generation Action
export async function generateMediaPrompt(productId: string, type: 'IMAGE' | 'VIDEO', platforms: string[]) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { project: { include: { persona: true } } }
        });

        if (!product) return { success: false, error: 'Product not found' };

        const features = JSON.parse(product.features || "[]").join(", ");
        const persona = product.project.persona;
        const visualStyle = persona?.visualDescription ? `Visual Style: ${persona.visualDescription}` : "";
        const avatarNote = (type === 'VIDEO' && persona?.avatarImage) ? "Note: The video will start with the persona's avatar. Ensure the action flows naturally from a character introduction." : "";

        const systemPrompt = persona?.description
            ? `You are this persona: ${persona.description}. Be creative, varied, and avoid repetition.`
            : `You are a helpful social media assistant. Be creative, varied, and avoid repetition.`;

        let userPrompt = "";

        if (type === 'IMAGE') {
            userPrompt = `
                Product: "${product.name}"
                Description: "${product.description}"
                Key Features: ${features}
                ${visualStyle}
                
                Task:
                1. Write a **Visual Prompt** for an AI Image Generator (Flux Realism). It must be detailed, photorealistic, and highly descriptive.
                2. Write a **Caption** for social media (${platforms.join(', ')}).

                Output JSON format:
                {
                    "prompt": "Highly detailed description of...",
                    "caption": "The social media caption..."
                }
            `;
        } else {
            // VIDEO: Kling specific structure
            userPrompt = `
                Product: "${product.name}"
                Description: "${product.description}"
                Key Features: ${features}
                ${visualStyle}
                ${avatarNote}

                Task:
                1. Write a **Visual Prompt** for AI Video (Kling). It MUST follow this specific structure:
                   "[Main Subject & Action] + [Camera Motion] + [Environment/Lighting] + [Style/Quality]"
                   - Keep it under 50 words.
                   - Be extremely specific about movement (e.g., "slow pan", "dynamic zoom", "steam rising").
                   - If using an avatar, describe them performing a natural action relevant to the product.
                
                2. Write a **Voiceover Script** (or caption) for social media (${platforms.join(', ')}).

                Output JSON format:
                {
                    "prompt": "A close up of X doing Y, shot with 85mm lens, warm cinematic lighting, high quality...",
                    "caption": "The script/caption..."
                }
            `;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 1.0,
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(completion.choices[0].message.content || "{}");

        return {
            success: true,
            prompt: content.prompt,
            caption: content.caption
        };

    } catch (error: any) {
        console.error("AI Generation failed:", error);
        return { success: false, error: error.message || "AI Generation failed" };
    }
}

// Deprecated: Old generateScript
export async function generateScript(productId: string, platforms: string[]) {
    return generateMediaPrompt(productId, 'VIDEO', platforms);
}

export async function saveContent(productId: string, type: string, url: string, platforms: string[], script: string) {
    try {
        const createdContents = [];

        // Batch create content for each platform
        for (const platform of platforms) {
            const content = await prisma.generatedContent.create({
                data: {
                    productId,
                    type,
                    url,
                    platform: platform,
                    status: 'DRAFT',
                    performanceMetrics: JSON.stringify({ script })
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
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const personaId = formData.get('personaId') as string;

    // Autopilot
    const isAutopilot = formData.get('isAutopilot') === 'on';
    const postsPerDay = Number(formData.get('postsPerDay')) || 1;
    const autopilotConfig = isAutopilot ? JSON.stringify({ postsPerDay }) : null;

    // Smart Emoji Generation (Mocked for speed)
    const keywords: { [key: string]: string } = {
        'grill': '🍖', 'bbq': '🔥', 'vegan': '🥗', 'dessert': '🍰',
        'drink': '🍹', 'cocktail': '🍸', 'breakfast': '🥞', 'italian': '🍝',
        'mexican': '🌮', 'asian': '🥢', 'bread': '🥖', 'family': '👨‍👩‍👧‍👦'
    };

    let emoji = "🍳";
    const lowerTitle = title.toLowerCase();
    for (const [key, icon] of Object.entries(keywords)) {
        if (lowerTitle.includes(key)) {
            emoji = icon;
            break;
        }
    }

    try {
        if (!title) {
            return { success: false, error: "Title is required" };
        }

        const project = await prisma.project.create({
            data: {
                title,
                description,
                personaId: personaId || null,
                emoji,
                isAutopilot,
                autopilotConfig
            }
        });

        revalidatePath('/projects');
        return { success: true, projectId: project.id };
    } catch (error: any) {
        console.error("Failed to create project:", error);
        return { success: false, error: "Failed to create project: " + (error.message || "Unknown error") };
    }
}

export async function createProduct(formData: FormData) {
    const projectId = formData.get('projectId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const features = formData.get('features') as string;
    const usage = formData.get('usage') as string;
    const background = formData.get('background') as string;

    // Validate inputs
    let parsedFeatures = "[]";
    let parsedUsage = "[]";

    try {
        // Try to parse if user pasted JSON, otherwise treat as newline separated list
        if (features.trim().startsWith('[')) {
            JSON.parse(features);
            parsedFeatures = features;
        } else {
            parsedFeatures = JSON.stringify(features.split('\n').filter(line => line.trim() !== ''));
        }

        if (usage.trim().startsWith('[')) {
            JSON.parse(usage);
            parsedUsage = usage;
        } else {
            parsedUsage = JSON.stringify(usage.split('\n').filter(line => line.trim() !== ''));
        }

        const product = await prisma.product.create({
            data: {
                projectId,
                name,
                description,
                features: parsedFeatures,
                usage: parsedUsage,
                background: background || null,
                images: "[]" // Placeholder
            }
        });

        revalidatePath(`/products/${product.id}`);
        revalidatePath(`/projects/${projectId}`);
        return { success: true, productId: product.id };

    } catch (error: any) {
        console.error("Failed to create product:", error);
        return { success: false, error: error.message || "Failed to create product" };
    }
}

// DEPRECATED: Old numeric setting actions removed in favor of text-based Personas.
// See src/app/personas/actions.ts for new logic.


export async function updateProject(id: string, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const personaId = formData.get('personaId') as string;

    const isAutopilot = formData.get('isAutopilot') === 'on';
    const postsPerDay = Number(formData.get('postsPerDay')) || 1;
    const autopilotConfig = isAutopilot ? JSON.stringify({ postsPerDay }) : null;

    try {
        await prisma.project.update({
            where: { id },
            data: {
                title,
                description,
                personaId: personaId || null,
                isAutopilot,
                autopilotConfig
            }
        });
        revalidatePath(`/projects/${id}`);
        revalidatePath('/projects');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update project:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteProject(id: string) {
    try {
        await prisma.project.delete({ where: { id } });
        revalidatePath('/projects');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete project:", error);
        return { success: false, error: error.message };
    }
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const features = formData.get('features') as string;
    const usage = formData.get('usage') as string;
    const background = formData.get('background') as string;

    // Validate inputs
    let parsedFeatures = "[]";
    let parsedUsage = "[]";

    try {
        if (features.trim().startsWith('[')) {
            JSON.parse(features);
            parsedFeatures = features;
        } else {
            parsedFeatures = JSON.stringify(features.split('\n').filter(line => line.trim() !== ''));
        }

        if (usage.trim().startsWith('[')) {
            JSON.parse(usage);
            parsedUsage = usage;
        } else {
            parsedUsage = JSON.stringify(usage.split('\n').filter(line => line.trim() !== ''));
        }

        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                features: parsedFeatures,
                usage: parsedUsage,
                background: background || null
            }
        });

        revalidatePath(`/products/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update product:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath('/products');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete product:", error);
        return { success: false, error: error.message };
    }
}

export async function generateImageAction(prompt: string) {
    return await generateImage(prompt);
}

export async function submitVideoAction(prompt: string, productId?: string) {
    let avatarUrl: string | undefined;

    if (productId) {
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: { project: { include: { persona: true } } }
            });
            if (product?.project?.persona?.avatarImage) {
                avatarUrl = product.project.persona.avatarImage;
                console.log("Using Avatar for Video:", avatarUrl);
            }
        } catch (e) {
            console.error("Error fetching persona avatar:", e);
        }
    }

    return await submitVideo(prompt, avatarUrl);
}

export async function checkVideoStatusAction(requestId: string) {
    return await checkVideoStatus(requestId);
}
