"use client";

import { createProduct, updateProduct, deleteProduct } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface Project {
    id: string;
    title: string;
}

interface Product {
    id: string;
    projectId: string;
    name: string;
    description: string;
    features: string | null;
    usage: string | null;
    background: string | null;
}

interface Props {
    projects: Project[];
    product?: Product;
}

export default function ProductForm({ projects, product }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectIdFromUrl = searchParams.get('projectId');

    // Determine default project ID: from product (edit), from URL (new), or first available
    const defaultProjectId = product?.projectId || projectIdFromUrl || (projects.length > 0 ? projects[0].id : "");

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!product;

    // Helper to format JSON array string back to newline-separated text
    const formatListText = (jsonString: string | null) => {
        if (!jsonString) return "";
        try {
            const arr = JSON.parse(jsonString);
            if (Array.isArray(arr)) {
                return arr.join('\n');
            }
            return jsonString; // Fallback
        } catch (e) {
            return jsonString;
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            let result;
            if (isEdit && product) {
                result = await updateProduct(product.id, formData);
            } else {
                result = await createProduct(formData);
            }

            if (result && !result.success) {
                setError(result.error || "Operation failed");
            } else {
                // Success
                if (isEdit) {
                    router.push(`/products/${product!.id}`);
                } else {
                    // createProduct returns productId
                    // result type here is unknown, let's cast or check
                    router.push(`/products/${(result as any).productId}`);
                }
            }
        });
    };

    const handleDelete = async () => {
        if (!product) return;
        if (!confirm("Are you sure you want to delete this product?")) return;

        startTransition(async () => {
            const result = await deleteProduct(product.id);
            if (result.success) {
                router.push('/products');
            } else {
                setError(result.error || "Failed to delete product");
            }
        });
    };

    return (
        <div className="card">
            {isEdit && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Edit Product</h2>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="btn"
                        style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 12px', fontSize: '0.9rem' }}
                    >
                        🗑️ Delete Product
                    </button>
                </div>
            )}

            <form action={handleSubmit}>
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
                        defaultValue={defaultProjectId}
                        disabled={isEdit} // Prevent moving products between projects for simplicity, or allowed? Let's allow unless specifically restricted. Actually, Prisma allows it. But let's keep it simple.
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-color)",
                            background: isEdit ? "var(--bg-contrast)" : "var(--bg-paper)",
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
                        defaultValue={product?.name}
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
                        defaultValue={product?.description}
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
                        defaultValue={product?.background || ""}
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
                            defaultValue={formatListText(product?.features || null)}
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
                            defaultValue={formatListText(product?.usage || null)}
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
                        disabled={isPending}
                        style={{ flex: 1 }}
                    >
                        {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Product")}
                    </button>
                </div>
            </form>
        </div>
    );
}
