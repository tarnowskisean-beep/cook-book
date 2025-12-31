"use client";

import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <main style={{
                marginLeft: "280px",
                flex: 1,
                padding: "var(--space-8)",
                background: "var(--color-background)"
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
