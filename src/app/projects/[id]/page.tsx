import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
        include: { recipes: true } // FUTURE: Include Persona
    });

    if (!project) {
        notFound();
    }

    return (
        <div>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <Link href="/projects" style={{ color: "var(--color-primary)", fontSize: "0.9rem", display: "inline-block", marginBottom: "var(--space-4)" }}>
                    ← Back to Projects
                </Link>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                        <h1 style={{ fontSize: "2.5rem", marginBottom: "var(--space-2)" }}>{project.title}</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px" }}>{project.description}</p>
                    </div>
                    <Link href={`/recipes/new?projectId=${project.id}`} className="btn btn-primary">
                        + Add Recipe
                    </Link>
                </div>
            </header>

            <section>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "var(--space-4)", borderBottom: "1px solid var(--border-color)", paddingBottom: "var(--space-2)" }}>Recipes</h2>

                {project.recipes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "var(--space-12)", background: "var(--bg-paper)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-color)" }}>
                        <p style={{ marginBottom: "var(--space-4)", color: "var(--text-muted)" }}>No recipes yet.</p>
                        <Link href={`/recipes/new?projectId=${project.id}`} className="btn btn-primary">Create First Recipe</Link>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                        {project.recipes.map((recipe) => (
                            <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="card" style={{ display: "block", transition: "transform 0.2s ease" }}>
                                <h3 style={{ fontSize: "1.2rem", marginBottom: "var(--space-2)" }}>{recipe.name}</h3>
                                <div style={{ display: "flex", gap: "var(--space-2)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                    <span>Added {new Date(recipe.createdAt).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
