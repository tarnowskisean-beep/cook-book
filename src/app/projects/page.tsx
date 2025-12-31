import prisma from '@/lib/prisma';
import Link from 'next/link';

// Force dynamic rendering since data changes
export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
    const projects = await prisma.project.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ maxWidth: "1000px" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>All Projects</h1>
                    <p style={{ color: "var(--text-muted)" }}>Manage your product lines.</p>
                </div>
                <Link href="/projects/new" className="btn btn-primary">
                    + New Project
                </Link>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                {projects.map((project) => (
                    <Link href={`/projects/${project.id}`} key={project.id} className="card" style={{ transition: "transform 0.2s", display: "flex", flexDirection: "column", gap: "var(--space-4)", textDecoration: "none", color: "inherit" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <div style={{ fontSize: "3rem" }}>{project.emoji}</div>
                            {project.isAutopilot && (
                                <div style={{ fontSize: "0.8rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "2px 8px", borderRadius: "10px" }}>
                                    Auto
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{project.title}</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "var(--space-2)", lineHeight: "1.5" }}>
                                {project.description || "No description provided."}
                            </p>
                        </div>
                        <div style={{ marginTop: "auto", paddingTop: "var(--space-4)", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                            {project._count.products} Products
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
