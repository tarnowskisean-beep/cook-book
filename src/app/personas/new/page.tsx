import PersonaForm from '../PersonaForm';

export default function NewPersonaPage() {
    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>New Persona</h1>
                <p style={{ color: "var(--text-muted)" }}>Create a new personality for your AI.</p>
            </header>
            <PersonaForm />
        </div>
    );
}
