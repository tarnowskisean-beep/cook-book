"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Projects", href: "/projects", icon: "📚" },
    { label: "Recipes", href: "/recipes", icon: "🍳" },
    { label: "Connections", href: "/connections", icon: "🔗" },
    { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside style={{
            width: "280px",
            background: "var(--color-surface)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            padding: "var(--space-8) var(--space-4)",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0
        }}>
            <div style={{ marginBottom: "var(--space-8)", padding: "0 var(--space-2)" }}>
                <h2 style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    background: "linear-gradient(to right, var(--color-primary-light), var(--color-accent))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    Everybook & Dom
                </h2>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--space-4)",
                                padding: "var(--space-4)",
                                borderRadius: "var(--radius-md)",
                                color: isActive ? "var(--color-primary-light)" : "var(--text-muted)",
                                background: isActive ? "rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)" : "transparent",
                                transition: "all 0.2s ease",
                                fontWeight: isActive ? 600 : 400
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = "var(--text-main)";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = "var(--text-muted)";
                                    e.currentTarget.style.background = "transparent";
                                }
                            }}
                        >
                            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ marginTop: "auto", padding: "var(--space-4)", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Status: <span style={{ color: "#4ade80" }}>● Online</span></p>
            </div>
        </aside>
    );
}
