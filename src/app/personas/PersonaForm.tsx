"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { managePersona } from "./actions";
import { generateImageAction } from "@/app/actions";

interface Props {
    persona?: {
        id: string;
        name: string;
        description: string | null;
        visualDescription: string | null;
        avatarImage: string | null;
    }
}

export default function PersonaForm({ persona }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>(persona?.avatarImage || "");
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

    const handleGenerateAvatar = async () => {
        const visual = (document.getElementById('visualDescription') as HTMLTextAreaElement)?.value;
        if (!visual) {
            alert("Please enter a visual description first.");
            return;
        }

        setIsGeneratingAvatar(true);
        try {
            const result = await generateImageAction(visual + " profile picture, character portrait, high quality, centered");
            if (result.success && result.url) {
                setAvatarUrl(result.url);
            } else {
                alert("Failed to generate avatar: " + result.error);
            }
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await managePersona(formData);
            if (result && !result.success) {
                setError(result.error || "Failed to save persona");
            }
        });
    };

    return (
        <form action={handleSubmit} className="card">
            {persona && <input type="hidden" name="id" value={persona.id} />}
            <input type="hidden" name="avatarImage" value={avatarUrl} />

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

            <div className="card" style={{ marginBottom: "var(--space-6)", background: "var(--bg-contrast)", border: "1px solid var(--border-color)" }}>
                <label style={{ display: "block", marginBottom: "var(--space-4)", fontWeight: 500 }}>
                    Avatar (Consistent Character)
                </label>

                <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                    <div
                        style={{
                            width: "100px",
                            height: "100px",
                            background: avatarUrl ? `url(${avatarUrl}) center/cover` : "#333",
                            borderRadius: "50%",
                            border: "2px solid var(--border-color)",
                            flexShrink: 0
                        }}
                    />
                    <div>
                        <button
                            type="button"
                            onClick={handleGenerateAvatar}
                            disabled={isGeneratingAvatar}
                            className="btn"
                            style={{ background: "var(--bg-paper)", border: "1px solid var(--border-color)", marginBottom: "var(--space-2)" }}
                        >
                            {isGeneratingAvatar ? "Generating..." : "✨ Generate from Visual Style"}
                        </button>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            This image will be used as the starting frame for videos to ensure character consistency.
                        </p>
                    </div>
                </div>
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
