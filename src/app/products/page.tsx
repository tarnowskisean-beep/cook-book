import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        include: {
            project: { select: { title: true, emoji: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ maxWidth: "1000px" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>All Products</h1>
                    <p style={{ color: "var(--text-muted)" }}>Browse your entire product log.</p>
                </div>
                <Link href="/products/new" className="btn btn-primary">
                    + New Product
                </Link>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                {products.length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "var(--space-12)", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                        <p style={{ marginBottom: "var(--space-4)", color: "var(--text-muted)" }}>No products found.</p>
                        <Link href="/products/new" className="btn">Add Your First Product</Link>
                    </div>
                ) : (
                    products.map((product) => (
                        <Link href={`/products/${product.id}`} key={product.id} className="card" style={{ transition: "transform 0.2s", display: "flex", flexDirection: "column", gap: "var(--space-3)", textDecoration: "none", color: "inherit" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                <div style={{ fontWeight: 600, fontSize: "1.2rem" }}>{product.name}</div>
                                <div style={{ fontSize: "1.5rem" }}>{product.project.emoji}</div>
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
                                {product.project.title}
                            </div>
                            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5" }}>
                                {product.description}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
