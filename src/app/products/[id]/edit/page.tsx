
import prisma from '@/lib/prisma';
import ProductForm from '@/components/ProductForm';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) notFound();

    const projects = await prisma.project.findMany({
        select: { id: true, title: true }
    });

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Edit Product</h1>
                <p style={{ color: "var(--text-muted)" }}>Update {product.name}</p>
            </header>

            <ProductForm projects={projects} product={product} />
        </div>
    );
}
