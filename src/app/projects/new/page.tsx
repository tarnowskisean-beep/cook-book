"use client";

import { createProject } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function NewProjectPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await createProject(formData);
            if (result.success && result.projectId) {
                router.push(`/projects/${result.projectId}`);
            } else {
                setError(result.error || "Failed to create project");
            }
        });
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>New Project</h1>
                <p style={{ color: "var(--text-muted)" }}>Start a new cookbook volume.</p>
            </header>

            <form action={handleSubmit} className="card">
                <div style={{ marginBottom: "var(--space-6)" }}>
                    <label htmlFor="title" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Project Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        placeholder="e.g. Summer Grilling 2025"
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(0,0,0,0.2)",
                            color: "var(--text-main)",
                            fontSize: "1rem"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "var(--space-6)" }}>
                    <label htmlFor="description" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        placeholder="What's this cookbook about?"
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(0,0,0,0.2)",
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
                        style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                    >
                        {isPending ? "Creating..." : "Create Project"}
                    </button>
                </div>
            </form>
        </div>
    );
}
