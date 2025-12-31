import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PersonasPage() {
    const personas = await prisma.persona.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <>
            <header style={{ marginBottom: "var(--space-8)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Personas</h1>
                    <p style={{ color: "var(--text-muted)" }}>Manage your AI personalities.</p>
                </div>
                <Link href="/personas/new" className="btn btn-primary">
                    + New Persona
                </Link>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                {personas.map((persona) => (
                    <Link href={`/personas/${persona.id}`} key={persona.id} className="card" style={{ display: "block", transition: "transform 0.2s ease" }}>
                        <h2 style={{ fontSize: "1.25rem", marginBottom: "var(--space-2)" }}>{persona.name}</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {persona.description || "No description provided."}
                        </p>
                    </Link>
                ))}
            </div>
        </>
    );
}
