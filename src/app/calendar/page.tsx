import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
    const posts = await prisma.post.findMany({
        where: {
            status: 'SCHEDULED',
            scheduledTime: {
                gte: new Date() // Future only
            }
        },
        include: {
            content: {
                include: {
                    product: { select: { name: true } }
                }
            }
        },
        orderBy: { scheduledTime: 'asc' }
    });

    // Group posts by Date
    const groupedPosts: Record<string, any[]> = {};
    posts.forEach(post => {
        if (!post.scheduledTime) return;
        const dateKey = new Date(post.scheduledTime).toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        if (!groupedPosts[dateKey]) groupedPosts[dateKey] = [];
        groupedPosts[dateKey].push(post);
    });

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Content Calendar</h1>
                <p style={{ color: "var(--text-muted)" }}>View upcoming scheduled content.</p>
            </header>

            <div style={{ display: "grid", gap: "var(--space-8)" }}>
                {Object.entries(groupedPosts).length === 0 ? (
                    <div style={{ padding: "var(--space-12)", textAlign: "center", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                        No upcoming posts.
                    </div>
                ) : (
                    Object.entries(groupedPosts).map(([date, posts]) => (
                        <div key={date}>
                            <h3 style={{ fontSize: "1.2rem", marginBottom: "var(--space-4)", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--border-color2)", color: "var(--color-primary)" }}>
                                {date}
                            </h3>
                            <div style={{ display: "grid", gap: "var(--space-4)" }}>
                                {posts.map(post => (
                                    <Link href={`/posts/${post.id}`} key={post.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: "4px solid #4ade80", cursor: "pointer", transition: "transform 0.1s" }}>
                                        <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                                            {/* Platform Icon Stub */}
                                            <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                {post.content.platform.includes('Instagram') ? '📸' :
                                                    post.content.platform.includes('TikTok') ? '🎵' : '📺'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{post.content.product.name}</div>
                                                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                                    {post.content.platform} • {post.scheduledTime ? new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unscheduled'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "0.8rem", padding: "var(--space-1) var(--space-3)", background: "rgba(74, 222, 128, 0.1)", color: "#4ade80", borderRadius: "var(--radius-sm)" }}>
                                            Manage
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
