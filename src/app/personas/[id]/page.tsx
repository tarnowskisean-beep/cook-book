import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PersonaForm from '../PersonaForm';

export default async function EditPersonaPage({ params }: { params: { id: string } }) {
    const persona = await prisma.persona.findUnique({
        where: { id: params.id }
    });

    if (!persona) {
        notFound();
    }

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Edit Persona</h1>
                <p style={{ color: "var(--text-muted)" }}>Update {persona.name}'s traits.</p>
            </header>
            <PersonaForm persona={persona} />
        </div>
    );
}
