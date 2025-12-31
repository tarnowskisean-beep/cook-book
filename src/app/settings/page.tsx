import prisma from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const persona = await prisma.persona.findFirst();

    return (
        <>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Settings</h1>
                <p style={{ color: "var(--text-muted)" }}>Configure your AI persona and automation preferences.</p>
            </header>

            <div style={{ maxWidth: "800px" }}>
                <SettingsForm initialData={persona} />
            </div>
        </>
    );
}
