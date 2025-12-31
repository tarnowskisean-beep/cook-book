"use client";

import { createProduct } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
    projects: { id: string; title: string }[]
}

export default function NewProductForm({ projects }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectIdFromUrl = searchParams.get('projectId');

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await createProduct(formData);
            if (result && !result.success) {
                setError(result.error || "Failed to create product");
            }
        });
    };

    return (
        <form action={handleSubmit} className="card">
            {error && (
                <div style={{ marginBottom: "var(--space-4)", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
                    {error}
                </div>
            )}

            <div style={{ marginBottom: "var(--space-6)" }}>
                <label htmlFor="projectId" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                    Project (Product Line)
                </label>
                <select
                    id="projectId"
                    name="projectId"
                    defaultValue={projectIdFromUrl || (projects.length > 0 ? projects[0].id : "")}
                    style={{
                        width: "100%",
                        padding: "var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-paper)",
                        color: "var(--text-main)",
                        fontSize: "1rem"
                    }}
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: "var(--space-6)" }}>
                <label htmlFor="name" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                    Product Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Smart Watch Series 5"
                    style={{
                        width: "100%",
                        padding: "var(--space-3)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-paper)",
                        color: "var(--text-main)",
                        fontSize: "1rem"
                    }}
                />
            </div>

            <div style={{ marginBottom: "var(--space-6)" }}>
                <label htmlFor="description" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                    Overview / Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Brief summary of the product..."
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
                <label htmlFor="background" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                    Background / "Why We Built It"
                </label>
                <textarea
                    id="background"
                    name="background"
                    rows={2}
                    placeholder="The story behind this product..."
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
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                    The AI uses this to add emotional depth to the post.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
                <div>
                    <label htmlFor="features" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Key Features (Specs)
                    </label>
                    <textarea
                        id="features"
                        name="features"
                        rows={6}
                        placeholder={"- OLED Display\n- 5 Day Battery\n- Waterproof"}
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-paper)",
                            color: "var(--text-main)",
                            fontSize: "0.9rem",
                            fontFamily: "monospace"
                        }}
                    />
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>One per line.</p>
                </div>

                <div>
                    <label htmlFor="usage" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Usage Instructions
                    </label>
                    <textarea
                        id="usage"
                        name="usage"
                        rows={6}
                        placeholder={"- Wear on left wrist\n- Double tap to wake\n- Swipe to see notifications"}
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-paper)",
                            color: "var(--text-main)",
                            fontSize: "0.9rem",
                            fontFamily: "monospace"
                        }}
                    />
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>One per line.</p>
                </div>
            </div>

            <div style={{ textAlign: "right" }}>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isPending}
                >
                    {isPending ? "Creating Product..." : "Create Product"}
                </button>
            </div>
        </form>
    );
}
