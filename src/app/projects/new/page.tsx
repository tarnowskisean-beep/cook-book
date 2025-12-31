import prisma from '@/lib/prisma';
import NewProjectForm from './NewProjectForm';

export default async function NewProjectPage() {
    const personas = await prisma.persona.findMany({
        select: { id: true, name: true }
    });

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>New Project</h1>
                <p style={{ color: "var(--text-muted)" }}>Start a new cookbook volume.</p>
            </header>

            {personas.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "var(--space-12)", background: "var(--bg-paper)", border: "1px dashed #eab308" }}>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: "var(--space-4)", color: "#eab308" }}>Missing Persona</h3>
                    <p style={{ marginBottom: "var(--space-6)", color: "var(--text-muted)" }}>
                        You need at least one AI Persona to create a project.
                    </p>
                    <a href="/personas/new" className="btn btn-primary" style={{ display: "inline-block" }}>
                        + Create First Persona
                    </a>
                </div>
            ) : (
                <NewProjectForm personas={personas} />
            )}
        </div>
    );
}
