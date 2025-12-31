import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
    const scheduledPosts = await prisma.post.findMany({
        where: { status: 'SCHEDULED' },
        include: {
            content: {
                include: {
                    recipe: { select: { name: true } }
                }
            }
        },
        orderBy: { scheduledTime: 'asc' }
    });

    // Group by date
    const groupedPosts: Record<string, typeof scheduledPosts> = scheduledPosts.reduce((acc: any, post) => {
        const dateKey = post.scheduledTime ? new Date(post.scheduledTime).toDateString() : 'Unscheduled';
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(post);
        return acc;
    }, {});

    return (
        <>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Content Calendar</h1>
                <p style={{ color: "var(--text-muted)" }}>View your upcoming scheduled posts.</p>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
                {Object.keys(groupedPosts).length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "var(--space-12)", color: "var(--text-muted)" }}>
                        <p>No upcoming posts scheduled.</p>
                        <Link href="/recipes" className="btn btn-primary" style={{ display: "inline-block", marginTop: "var(--space-4)" }}>
                            Schedule Content
                        </Link>
                    </div>
                ) : (
                    Object.entries(groupedPosts).map(([date, posts]) => (
                        <div key={date}>
                            <h3 style={{
                                fontSize: "1.2rem",
                                marginBottom: "var(--space-4)",
                                color: "var(--color-primary-light)",
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--space-2)"
                            }}>
                                📅 {date}
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
                                                <div style={{ fontWeight: 600 }}>{post.content.recipe.name}</div>
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
        </>
    );
}
