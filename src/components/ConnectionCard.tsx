"use client";

import { toggleConnection } from "@/app/actions";
import { useTransition } from "react";

interface ConnectionCardProps {
    platform: {
        id: string;
        name: string;
        icon: string;
        color: string;
    };
    isConnected: boolean;
}

export default function ConnectionCard({ platform, isConnected }: ConnectionCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleConnection(platform.id);
        });
    };

    return (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: platform.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    color: "#fff"
                }}>
                    {platform.icon}
                </div>
                <div>
                    <h3 style={{ fontSize: "1.1rem" }}>{platform.name}</h3>
                    <span style={{
                        fontSize: "0.8rem",
                        color: isConnected ? "#4ade80" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}>
                        {isConnected ? "● Connected" : "○ Not Connected"}
                    </span>
                </div>
            </div>

            <div style={{ marginTop: "auto" }}>
                <button
                    onClick={handleToggle}
                    disabled={isPending}
                    className={isConnected ? "btn" : "btn btn-primary"}
                    style={{
                        width: "100%",
                        opacity: isPending ? 0.7 : (isConnected ? 0.6 : 1),
                        background: isConnected ? "rgba(255,255,255,0.1)" : "var(--color-primary)"
                    }}
                >
                    {isPending ? "Connecting..." : (isConnected ? "Disconnect" : "Connect Account")}
                </button>
            </div>
        </div>
    );
}
