
import prisma from '@/lib/prisma';
import ProjectForm from '@/components/ProjectForm';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: Props) {
    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id }
    });

    if (!project) notFound();

    const personas = await prisma.persona.findMany({
        select: { id: true, name: true }
    });

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Edit Project</h1>
                <p style={{ color: "var(--text-muted)" }}>Update project settings.</p>
            </header>

            <ProjectForm personas={personas} project={project} />
        </div>
    );
}
