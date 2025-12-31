import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            project: {
                include: {
                    persona: true
                }
            }
        }
    });

    if (!product) notFound();

    const features = JSON.parse(product.features || "[]");
    const usage = JSON.parse(product.usage || "[]");

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <Link href={`/projects/${product.projectId}`} style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.9rem" }}>
                    ← Back to {product.project.title}
                </Link>
                <div style={{ marginTop: "var(--space-4)" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <h1 style={{ fontSize: "3rem", margin: 0, fontFamily: "var(--font-serif)" }}>{product.name}</h1>
                            <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>{product.description}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <Link href={`/products/${product.id}/edit`} className="btn" style={{ background: "var(--bg-contrast)", border: "1px solid var(--border-color)" }}>
                                ✏️ Edit
                            </Link>
                            <Link href={`/products/${product.id}/generate`} className="btn btn-primary">
                                ✨ Generate Content
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-8)" }}>

                {/* Main Content */}
                <div>
                    <div className="card" style={{ marginBottom: "var(--space-6)" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "var(--space-4)", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--border-color2)" }}>Key Features</h2>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {features.map((item: string, i: number) => (
                                <li key={i} style={{ padding: "var(--space-3) 0", borderBottom: i < features.length - 1 ? "1px dashed var(--border-color2)" : "none" }}>
                                    ✅ {item}
                                </li>
                            ))}
                            {features.length === 0 && <li style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No features listed.</li>}
                        </ul>
                    </div>

                    <div className="card">
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "var(--space-4)", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--border-color2)" }}>Usage / Details</h2>
                        <ol style={{ paddingLeft: "var(--space-4)" }}>
                            {usage.map((step: string, i: number) => (
                                <li key={i} style={{ marginBottom: "var(--space-3)", lineHeight: "1.6" }}>
                                    {step}
                                </li>
                            ))}
                            {usage.length === 0 && <li style={{ color: "var(--text-muted)", fontStyle: "italic", listStyle: "none", marginLeft: "-1rem" }}>No usage instructions.</li>}
                        </ol>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    <div className="card" style={{ background: "var(--bg-contrast)", border: "none" }}>
                        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "var(--space-4)" }}>
                            Details
                        </h3>
                        <div style={{ marginBottom: "var(--space-4)" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Product Line</div>
                            <Link href={`/projects/${product.projectId}`} style={{ fontWeight: 600, color: "var(--text-main)" }}>
                                {product.project.emoji} {product.project.title}
                            </Link>
                        </div>
                        <div style={{ marginBottom: "var(--space-4)" }}>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Background</div>
                            <div style={{ fontSize: "0.9rem", fontStyle: "italic" }}>"{product.background || "No backstory."}"</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>AI Persona</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                                <div style={{ fontSize: "0.9rem" }}>{product.project.persona?.name || "Default Assistant"}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
