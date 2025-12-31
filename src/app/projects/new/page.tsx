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
            <NewProjectForm personas={personas} />
        </div>
    );
}
