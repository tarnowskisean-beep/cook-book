import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PostQueue() {
    const posts = await prisma.post.findMany({
        where: { status: 'SCHEDULED' },
        orderBy: { scheduledTime: 'asc' },
        include: {
            content: {
                include: {
                    product: { select: { name: true } }
                }
            }
        }
    });

    return (
        <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <h3 style={{ fontSize: "1.25rem" }}>Scheduled Posts</h3>
                <Link href="/calendar" style={{ fontSize: "0.8rem", color: "var(--color-primary)" }}>View Calendar</Link>
            </div>

            {posts.length === 0 ? (
                <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)" }}>
                    <p>No posts scheduled.</p>
                    <Link href="/recipes" style={{ display: "inline-block", marginTop: "var(--space-2)", fontSize: "0.9rem", color: "var(--color-accent)" }}>
                        Create content from recipes →
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {posts.map((post) => (
                        <div key={post.id} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-4)",
                            padding: "var(--space-3)",
                            borderBottom: "1px solid var(--border-color2)"
                        }}>
                            <div style={{ width: "40px", height: "40px", background: "var(--bg-contrast)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {post.content.platform === 'Instagram' ? '📸' : '🎵'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{post.content.product.name}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                    {post.scheduledTime ? new Date(post.scheduledTime).toLocaleDateString() : 'Unscheduled'}
                                </div>
                            </div>
                            <div style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(74, 222, 128, 0.1)", color: "#4ade80" }}>
                                Scheduled
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
