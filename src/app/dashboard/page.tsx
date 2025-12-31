import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    // Parallel data fetching for performance
    const [projectCount, productCount, scheduledCount, recentProjects, upcomingPosts] = await Promise.all([
        prisma.project.count(),
        prisma.product.count(),
        prisma.post.count({ where: { status: 'SCHEDULED' } }),
        prisma.project.findMany({
            take: 4,
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { products: true } } }
        }),
        prisma.post.findMany({
            where: { status: 'SCHEDULED' },
            take: 3,
            orderBy: { scheduledTime: 'asc' },
            include: {
                content: {
                    include: { product: { include: { project: true } } }
                }
            }
        })
    ]);

    return (
        <div style={{ maxWidth: "1000px" }}>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Dashboard</h1>
                <p style={{ color: "var(--text-muted)" }}>Welcome back.</p>
            </header>

            {/* Metrics */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-6)",
                marginBottom: "var(--space-8)"
            }}>
                <MetricCard label="Product Lines" value={projectCount} icon="📚" />
                <MetricCard label="Total Products" value={productCount} icon="📦" />
                <MetricCard label="Scheduled Posts" value={scheduledCount} icon="📅" color="#4ade80" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-8)", alignItems: "start" }}>

                {/* Left Column: Recent Work */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Recent Projects</h2>
                        <Link href="/projects" style={{ fontSize: "0.9rem", color: "var(--color-primary)" }}>View All →</Link>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
                        {recentProjects.map(p => (
                            <Link key={p.id} href={`/projects/${p.id}`} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", transition: "transform 0.2s" }}>
                                <div style={{ fontSize: "2rem" }}>{p.emoji}</div>
                                <div style={{ fontWeight: 600 }}>{p.title}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p._count.products} Products</div>
                            </Link>
                        ))}
                        <Link href="/projects/new" className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", borderStyle: "dashed", background: "transparent" }}>
                            <div style={{ fontSize: "2rem", opacity: 0.5 }}>➕</div>
                            <div style={{ fontWeight: 600, color: "var(--text-muted)" }}>Create New</div>
                        </Link>
                    </div>

                    <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "var(--space-4)" }}>Quick Actions</h2>
                    <div style={{ display: "flex", gap: "var(--space-4)" }}>
                        <Link href="/products/new" className="btn btn-primary">
                            + Add Product
                        </Link>
                        <Link href="/personas/new" className="btn" style={{ background: "var(--bg-contrast)", border: "1px solid var(--border-color)" }}>
                            + New Persona
                        </Link>
                    </div>
                </div>

                {/* Right Column: Schedule */}
                <div className="card" style={{ padding: "0" }}>
                    <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontWeight: 600 }}>Upcoming Schedule</h3>
                        <Link href="/calendar" style={{ fontSize: "0.8rem", color: "var(--color-primary)" }}>Calendar</Link>
                    </div>
                    <div>
                        {upcomingPosts.length === 0 ? (
                            <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                Nothing scheduled.
                            </div>
                        ) : (
                            upcomingPosts.map(post => (
                                <Link key={post.id} href={`/posts/${post.id}`} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4)", borderBottom: "1px solid var(--border-color2)", alignItems: "center", textDecoration: "none" }}>
                                    <div style={{ fontSize: "1.5rem" }}>{post.content.product.project.emoji}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.content.product.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                            {new Date(post.scheduledTime!).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                                        {post.content.platform === 'Instagram' ? '📸' : post.content.platform === 'TikTok' ? '🎵' : '📄'}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon, color }: any) {
    return (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <div style={{ fontSize: "2rem" }}>{icon}</div>
            <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: color || "inherit" }}>{value}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</div>
            </div>
        </div>
    );
}
