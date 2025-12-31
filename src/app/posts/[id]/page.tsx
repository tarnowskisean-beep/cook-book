import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditScriptForm, CancelButton } from './ClientComponents';

interface Props {
    params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: Props) {
    const { id } = await params;

    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            content: {
                include: {
                    product: {
                        include: { project: true }
                    }
                }
            }
        }
    });

    if (!post) notFound();

    // Parse script from metrics safely
    let script = "";
    try {
        const metrics = post.content.performanceMetrics ? JSON.parse(post.content.performanceMetrics) : {};
        script = metrics.script || "";
    } catch (e) { script = "Error parsing script"; }

    return (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <Link href="/calendar" style={{ color: "var(--color-primary)", fontSize: "0.9rem", display: "inline-block", marginBottom: "var(--space-4)" }}>
                    ← Back to Calendar
                </Link>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Manage Post</h1>
                        <p style={{ color: "var(--text-muted)" }}>
                            Scheduled for {post.scheduledTime ? new Date(post.scheduledTime).toLocaleString() : 'Unscheduled'}
                        </p>
                    </div>
                    <CancelButton postId={post.id} />
                </div>
            </header>

            <div className="card" style={{ marginBottom: "var(--space-6)" }}>
                <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-4)", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--border-color)" }}>
                    <div style={{ fontSize: "3rem" }}>{post.content.product.project.emoji}</div>
                    <div>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>{post.content.product.name}</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Project: {post.content.product.project.title}</p>
                        <div style={{ display: "inline-block", marginTop: "var(--space-2)", padding: "2px 8px", borderRadius: "10px", background: "var(--bg-contrast)", fontSize: "0.8rem" }}>
                            {post.content.platform}
                        </div>
                    </div>
                </div>

                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>Caption / Script</h3>
                <EditScriptForm postId={post.id} contentId={post.content.id} initialScript={script} />
            </div>
        </div>
    );
}
