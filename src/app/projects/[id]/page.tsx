import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            products: true,
            persona: true
        }
    });

    if (!project) notFound();

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ marginBottom: "var(--space-8)", display: "flex", gap: "var(--space-6)", alignItems: "center" }}>
                <div style={{ fontSize: "4rem" }}>{project.emoji}</div>
                <div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "var(--space-2)" }}>{project.title}</h1>
                    <p style={{ fontSize: "1.1rem", color: "var(--text-muted)" }}>{project.description}</p>
                    {project.persona && (
                        <div style={{ marginTop: "var(--space-2)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", background: "var(--bg-contrast)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.9rem" }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                            Assigned Persona: <strong>{project.persona.name}</strong>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
                <h2 style={{ fontSize: "1.5rem" }}>Products ({project.products.length})</h2>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <Link href={`/projects/${project.id}/edit`} className="btn" style={{ background: "var(--bg-contrast)", border: "1px solid var(--border-color)" }}>
                        ⚙️ Settings
                    </Link>
                    <Link href={`/products/new?projectId=${project.id}`} className="btn btn-primary">
                        + Add Product
                    </Link>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                {project.products.length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "var(--space-12)", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-lg)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                        <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>No products in this project yet.</p>
                        <Link href={`/products/new?projectId=${project.id}`} className="btn">Add Your First Product</Link>
                    </div>
                ) : (
                    project.products.map(product => (
                        <Link href={`/products/${product.id}`} key={product.id} className="card" style={{ textDecoration: "none" }}>
                            <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 600 }}>{product.name}</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "var(--space-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {product.description}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
