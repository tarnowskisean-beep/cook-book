'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function cancelPost(formData: FormData) {
    const postId = formData.get('postId') as string;
    if (!postId) return { success: false, error: "Post ID required" };

    try {
        // 1. Get the post to find the contentId
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) throw new Error("Post not found");

        // 2. Delete the Scheduled Post entry
        await prisma.post.delete({
            where: { id: postId }
        });

        // 3. Reset the Content status to DRAFT
        await prisma.generatedContent.update({
            where: { id: post.contentId },
            data: { status: 'DRAFT' }
        });

    } catch (error) {
        console.error("Failed to cancel post:", error);
        return { success: false, error: "Failed to cancel post" };
    }

    revalidatePath('/calendar');
    revalidatePath('/dashboard');
    redirect('/calendar');
}

export async function updatePostScript(formData: FormData) {
    const postId = formData.get('postId') as string;
    const newScript = formData.get('script') as string;
    const contentId = formData.get('contentId') as string;

    try {
        // Update the metric/script in GeneratedContent
        // Note: In a real app we might want to store script in a dedicated column, 
        // but currently it's in `performanceMetrics` JSON based on previous patterns.

        await prisma.generatedContent.update({
            where: { id: contentId },
            data: {
                performanceMetrics: JSON.stringify({ script: newScript })
            }
        });

    } catch (error) {
        console.error("Failed to update script:", error);
        return { success: false, error: "Failed to update script" };
    }

    revalidatePath(`/posts/${postId}`);
    revalidatePath('/calendar');
    return { success: true };
}
// Update media URL
export async function updatePostMedia(formData: FormData) {
    const postId = formData.get('postId') as string;
    const contentId = formData.get('contentId') as string;
    const newUrl = formData.get('url') as string;

    try {
        await prisma.generatedContent.update({
            where: { id: contentId },
            data: { url: newUrl }
        });
    } catch (error) {
        console.error("Failed to update media:", error);
        return { success: false, error: "Failed to update media" };
    }

    revalidatePath(`/posts/${postId}`);
    revalidatePath('/calendar');
    return { success: true };
}
