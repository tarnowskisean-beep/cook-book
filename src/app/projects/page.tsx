import prisma from '@/lib/prisma';
import Link from 'next/link';

// Force dynamic rendering since data changes
export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    const projects = await prisma.project.findMany({
        include: {
            recipes: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <>
            <header style={{ marginBottom: "var(--space-8)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Projects</h1>
                    <p style={{ color: "var(--text-muted)" }}>Manage your cookbook volumes.</p>
                </div>
                <Link href="/projects/new" className="btn btn-primary">
                    + New Project
                </Link>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                {projects.map((project) => (
                    <Link href={`/projects/${project.id}`} key={project.id} className="card" style={{ display: "block", transition: "transform 0.2s ease" }}>
                        <div style={{
                            height: "200px",
                            marginBottom: "var(--space-4)",
                            borderRadius: "var(--radius-md)",
                            background: project.coverImage ? `url(${project.coverImage}) center/cover` : "rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-muted)"
                        }}>
                            {!project.coverImage && "No Cover Image"}
                        </div>
                        <h2 style={{ fontSize: "1.25rem", marginBottom: "var(--space-2)" }}>{project.title}</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.description}</p>
                        <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-4)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            <span>📖 {project.recipes.length} Recipes</span>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
