import prisma from '@/lib/prisma';
import ProductForm from '@/components/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
    // Fetch projects for the dropdown
    const projects = await prisma.project.findMany({
        select: { id: true, title: true },
        orderBy: { title: 'asc' }
    });

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Add New Product</h1>
                <p style={{ color: "var(--text-muted)" }}>Add a new item to the product log.</p>
            </header>

            <ProductForm projects={projects} />
        </div>
    );
}
