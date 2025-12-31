import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ScriptGenerator from './ScriptGenerator';

interface Props {
    params: Promise<{ id: string }>
}

export default async function GenerateContentPage({ params }: Props) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: { project: { include: { persona: true } } }
    });

    if (!product) notFound();

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <Link href={`/products/${product.id}`} style={{ color: "var(--color-primary)", display: "inline-block", marginBottom: "var(--space-4)" }}>← Back to Product</Link>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Generate Content</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
                    Create AI-powered scripts for <strong>{product.name}</strong>.
                </p>
            </header>

            <div style={{ display: "grid", gap: "var(--space-6)" }}>

                {/* Context Card */}
                <div className="card" style={{ background: "var(--bg-contrast)", border: "none" }}>
                    <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                        <div style={{ fontSize: "2.5rem" }}>{product.project.emoji}</div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Context</div>
                            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                                Generating as <strong>{product.project.persona?.name || "Default Assistant"}</strong> for {product.project.title}.
                            </div>
                        </div>
                    </div>
                </div>

                <ScriptGenerator
                    productId={product.id}
                    productName={product.name}
                />
            </div>
        </div>
    );
}
