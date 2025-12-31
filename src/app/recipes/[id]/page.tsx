import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Next.js 15+: params is a Promise
export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: {
            project: true,
            content: true // Social content
        }
    });

    if (!recipe) {
        return notFound();
    }

    // Parse JSON fields safely
    const ingredients = JSON.parse(recipe.ingredients as string);
    const instructions = JSON.parse(recipe.instructions as string);

    return (
        <>
            <div style={{ marginBottom: "var(--space-6)" }}>
                <Link href="/recipes" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>← Back to Recipes</Link>
            </div>

            <header style={{ marginBottom: "var(--space-8)", display: "flex", gap: "var(--space-8)", alignItems: "flex-start" }}>
                <div style={{
                    width: "300px",
                    height: "300px",
                    borderRadius: "var(--radius-lg)",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "4rem"
                }}>
                    🥘
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "var(--space-4)" }}>
                        <span style={{ color: "var(--color-accent)", fontSize: "0.9rem", fontWeight: 600 }}>
                            {recipe.project.title}
                        </span>
                        <h1 style={{ fontSize: "2.5rem", marginTop: "var(--space-2)", lineHeight: 1.2 }}>{recipe.name}</h1>
                    </div>

                    <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "var(--space-6)" }}>
                        {recipe.description}
                    </p>

                    <div style={{ display: "flex", gap: "var(--space-4)" }}>
                        <Link href={`/recipes/${recipe.id}/generate`} className="btn btn-primary">Generate Video Content</Link>
                        <button className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>Edit Recipe</button>
                    </div>
                </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "var(--space-8)" }}>
                <section className="card">
                    <h3 style={{ fontSize: "1.25rem", marginBottom: "var(--space-4)", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "var(--space-2)" }}>Ingredients</h3>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {ingredients.map((ing: any, i: number) => (
                            <li key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "var(--space-2)", borderBottom: "1px dashed rgba(255,255,255,0.05)" }}>
                                <span>{ing.item}</span>
                                <span style={{ color: "var(--text-muted)" }}>{ing.amount}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="card">
                    <h3 style={{ fontSize: "1.25rem", marginBottom: "var(--space-4)", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "var(--space-2)" }}>Instructions</h3>
                    <ol style={{ paddingLeft: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                        {instructions.map((step: string, i: number) => (
                            <li key={i} style={{ paddingLeft: "var(--space-2)" }}>
                                <p>{step}</p>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>
        </>
    );
}
