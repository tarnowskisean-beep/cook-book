import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
    const recipes = await prisma.recipe.findMany({
        include: {
            project: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <>
            <header style={{ marginBottom: "var(--space-8)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Recipes</h1>
                    <p style={{ color: "var(--text-muted)" }}>Browse all recipes across your cookbooks.</p>
                </div>
                <Link href="/recipes/new" className="btn btn-primary">
                    + New Recipe
                </Link>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                {recipes.map((recipe) => (
                    <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="card" style={{ display: "block", transition: "transform 0.2s ease" }}>
                        <div style={{
                            height: "200px",
                            marginBottom: "var(--space-4)",
                            borderRadius: "var(--radius-md)",
                            background: "rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-muted)",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            {/* Placeholder for image logic */}
                            <span style={{ fontSize: "3rem" }}>🥘</span>
                        </div>
                        <div style={{ marginBottom: "var(--space-2)" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "1px" }}>
                                {recipe.project.title}
                            </span>
                        </div>
                        <h2 style={{ fontSize: "1.25rem", marginBottom: "var(--space-2)" }}>{recipe.name}</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {recipe.description}
                        </p>
                    </Link>
                ))}
            </div>
        </>
    );
}
