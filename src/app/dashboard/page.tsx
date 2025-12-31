import PostQueue from '@/components/PostQueue';

export default function DashboardPage() {
    return (
        <>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Dashboard</h1>
                <p style={{ color: "var(--text-muted)" }}>Overview of your cookbook content and social performance.</p>
            </header>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "var(--space-6)",
                marginBottom: "var(--space-8)"
            }}>
                {/* Metric Cards - Mock Data */}
                {[
                    { label: "Total Posts", value: "124", change: "+12%" },
                    { label: "Total Views", value: "45.2K", change: "+8.5%" },
                    { label: "Engagement Rate", value: "4.8%", change: "+0.2%" },
                    { label: "Recipes Published", value: "12", change: "New" }
                ].map((metric) => (
                    <div key={metric.label} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{metric.label}</span>
                        <span style={{ fontSize: "2rem", fontWeight: 700 }}>{metric.value}</span>
                        <span style={{ fontSize: "0.8rem", color: "#4ade80" }}>{metric.change}</span>
                    </div>
                ))}
            </div>

            <PostQueue />
        </>
    );
}
