import prisma from '@/lib/prisma';
import ContentWizard from '@/components/ContentWizard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: { project: true }
    });

    if (!recipe) {
        return notFound();
    }

    // Sanitize recipe data for client component (dates to strings if needed, though Next 13+ handles simple dates well usually, pure objects safer)
    const serializableRecipe = {
        ...recipe,
        createdAt: recipe.createdAt.toISOString(),
        updatedAt: recipe.updatedAt.toISOString(),
        project: {
            ...recipe.project,
            createdAt: recipe.project.createdAt.toISOString(),
            updatedAt: recipe.project.createdAt.toISOString(),
            publicationDate: recipe.project.publicationDate?.toISOString() || null
        }
    };

    return (
        <>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <div style={{ marginBottom: "var(--space-4)" }}>
                    <Link href={`/recipes/${id}`} style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>← Back to Recipe</Link>
                </div>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Content Studio</h1>
                <p style={{ color: "var(--text-muted)" }}>
                    Generating content for <span style={{ color: "var(--color-accent)" }}>{recipe.name}</span>
                </p>
            </header>

            <ContentWizard recipe={serializableRecipe} />
        </>
    );
}
