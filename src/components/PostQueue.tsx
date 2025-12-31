import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PostQueue() {
    const scheduledPosts = await prisma.post.findMany({
        where: { status: 'SCHEDULED' },
        include: {
            content: {
                include: {
                    recipe: { select: { name: true } }
                }
            }
        },
        orderBy: { scheduledTime: 'asc' },
        take: 5
    });

    return (
        <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <h3 style={{ fontSize: "1.25rem" }}>Scheduled Posts</h3>
                <Link href="/calendar" style={{ fontSize: "0.8rem", color: "var(--color-primary)" }}>View Calendar</Link>
            </div>

            {scheduledPosts.length === 0 ? (
                <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)" }}>
                    <p>No posts scheduled.</p>
                    <Link href="/recipes" style={{ display: "inline-block", marginTop: "var(--space-2)", fontSize: "0.9rem", color: "var(--color-accent)" }}>
                        Create content from recipes →
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {scheduledPosts.map((post) => (
                        <div key={post.id} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "var(--space-3)",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "var(--radius-sm)",
                            borderLeft: "3px solid #4ade80"
                        }}>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: "0.95rem" }}>{post.content.recipe.name}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "var(--space-2)" }}>
                                    <span>{post.content.platform}</span>
                                    <span>•</span>
                                    <span>{post.scheduledTime ? new Date(post.scheduledTime).toLocaleDateString() : 'Unscheduled'}</span>
                                </div>
                            </div>
                            <button className="btn" style={{ padding: "var(--space-1) var(--space-3)", fontSize: "0.8rem" }}>
                                Post Now
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
