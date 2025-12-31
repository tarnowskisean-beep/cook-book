"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { managePersona } from "./actions";

interface Props {
    persona?: {
        id: string;
        name: string;
        description: string | null;
        visualDescription: string | null;
    }
}

export default function PersonaForm({ persona }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await managePersona(formData);
            if (result && !result.success) {
                setError(result.error || "Failed to save persona");
            }
            // On success, redirect happens in server action, or we can handle it here if it returned success
        });
    };

    return (
        <form action={handleSubmit} className="card">
            {persona && <input type="hidden" name="id" value={persona.id} />}

            <div style={{ marginBottom: "var(--space-6)" }}>
                <label htmlFor="name" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={persona?.name}
                    required
                    placeholder="e.g. Nonna Maria"
                    style={{
                        width: "100%",
                        padding: "var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-contrast)",
                        color: "var(--text-main)",
                        fontSize: "1rem"
                    }}
                />
            </div>

            <div style={{ marginBottom: "var(--space-6)" }}>
                <label htmlFor="description" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                    Personality Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={5}
                    defaultValue={persona?.description || ""}
                    placeholder="Describe how they speak and act. E.g. A grumpy but loving Italian grandmother who scolds you for using jarred sauce."
                    style={{
                        width: "100%",
                        padding: "var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-contrast)",
                        color: "var(--text-main)",
                        fontSize: "1rem",
                        fontFamily: "inherit"
                    }}
                />
            </div>

            <div style={{ marginBottom: "var(--space-6)" }}>
                <label htmlFor="visualDescription" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                    Visual Style (for AI prompts)
                </label>
                <textarea
                    id="visualDescription"
                    name="visualDescription"
                    rows={3}
                    defaultValue={persona?.visualDescription || ""}
                    placeholder="E.g. Warm lighting, rustic kitchen, flour everywhere."
                    style={{
                        width: "100%",
                        padding: "var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-contrast)",
                        color: "var(--text-main)",
                        fontSize: "1rem",
                        fontFamily: "inherit"
                    }}
                />
            </div>

            {error && (
                <div style={{ marginBottom: "var(--space-4)", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
                    {error}
                </div>
            )}

            <div style={{ display: "flex", gap: "var(--space-4)" }}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn"
                    style={{ background: "transparent", border: "1px solid var(--border-color)" }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                >
                    {persona ? "Save Changes" : "Create Persona"}
                </button>
            </div>
        </form>
    );
}
