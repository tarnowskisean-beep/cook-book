"use client";

import { createRecipe } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
    projects: { id: string; title: string }[];
}

export default function NewRecipeForm({ projects }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await createRecipe(formData);
            if (result.success && result.recipeId) {
                router.push(`/recipes/${result.recipeId}`);
            } else {
                setError(result.error || "Failed to create recipe");
            }
        });
    };

    return (
        <form action={handleSubmit} className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="name" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Recipe Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        placeholder="e.g. Nonna's Lasagna"
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

                <div style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="projectId" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Cookbook Project
                    </label>
                    <select
                        id="projectId"
                        name="projectId"
                        required
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(0,0,0,0.2)",
                            color: "var(--text-main)",
                            fontSize: "1rem"
                        }}
                    >
                        <option value="">Select a project...</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="originStory" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Origin Story <span style={{ fontSize: "0.8em", color: "var(--color-accent)" }}>(AI Memory)</span>
                    </label>
                    <textarea
                        id="originStory"
                        name="originStory"
                        rows={3}
                        placeholder="e.g. Grandma brought this recipe from Sicily in 1942..."
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-accent)", // Highlight as special
                            background: "rgba(var(--accent-h), var(--accent-s), var(--accent-l), 0.1)",
                            color: "var(--text-main)",
                            fontSize: "1rem",
                            fontFamily: "inherit"
                        }}
                    />
                    <p style={{ marginTop: "4px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        When "Nostalgia" is high, Dom will use this specific story in the content.
                    </p>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="description" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Short Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        placeholder="A brief story about this dish..."
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

                <div>
                    <label htmlFor="ingredients" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Ingredients (One per line)
                    </label>
                    <textarea
                        id="ingredients"
                        name="ingredients"
                        rows={10}
                        placeholder="2 cups flour&#10;1 tsp salt&#10;..."
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(0,0,0,0.2)",
                            color: "var(--text-main)",
                            fontSize: "0.9rem",
                            fontFamily: "monospace"
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="instructions" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Instructions (One per line)
                    </label>
                    <textarea
                        id="instructions"
                        name="instructions"
                        rows={10}
                        placeholder="Preheat oven to 350F.&#10;Mix dry ingredients.&#10;..."
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(0,0,0,0.2)",
                            color: "var(--text-main)",
                            fontSize: "0.9rem",
                            fontFamily: "monospace"
                        }}
                    />
                </div>
            </div>

            {error && (
                <div style={{ marginTop: "var(--space-4)", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
                    {error}
                </div>
            )}

            <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
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
                    {isPending ? "Creating Recipe..." : "Create Recipe"}
                </button>
            </div>
        </form>
    );
}
