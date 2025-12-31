'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function managePersona(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const visualDescription = formData.get('visualDescription') as string;
    const id = formData.get('id') as string;

    if (!name) return { success: false, error: "Name is required" };

    try {
        if (id) {
            // Update
            await prisma.persona.update({
                where: { id },
                data: { name, description, visualDescription }
            });
        } else {
            // Create
            await prisma.persona.create({
                data: { name, description, visualDescription }
            });
        }
    } catch (error) {
        console.error("Failed to save persona:", error);
        return { success: false, error: "Database error" };
    }

    revalidatePath('/personas');
    redirect('/personas');
}
