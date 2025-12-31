"use client";

import { updateSettings, optimizePersona } from "@/app/actions";
import { useState, useTransition } from "react";

interface Props {
    initialData: any;
}

export default function SettingsForm({ initialData }: Props) {
    const [isPending, startTransition] = useTransition();

    // Parse initial data safely
    const autopilot = initialData?.autopilotSettings ? JSON.parse(initialData.autopilotSettings) : { enabled: true, postsPerDay: 1, requireApproval: true };
    const personality = initialData?.personalityTraits ? JSON.parse(initialData.personalityTraits) : { sassLevel: 5, energyLevel: 5, nostalgiaLevel: 5 };
    const voice = initialData?.voiceSettings ? JSON.parse(initialData.voiceSettings).voice : 'Dom (Soft-spoken Italian-American)';

    // Local state for live feedback on sliders
    const [postsPerDay, setPostsPerDay] = useState(autopilot.postsPerDay);
    const [sass, setSass] = useState(personality.sassLevel);
    const [energy, setEnergy] = useState(personality.energyLevel);
    const [nostalgia, setNostalgia] = useState(personality.nostalgiaLevel);

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            await updateSettings(formData);
            alert("Settings Saved!");
        });
    };

    return (
        <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>

            {/* Persona Settings */}
            <section className="card">
                <h2 style={{ fontSize: "1.25rem", marginBottom: "var(--space-6)", paddingBottom: "var(--space-4)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    AI Persona Configuration
                    <button
                        type="button"
                        onClick={async () => {
                            const result = await optimizePersona();
                            if (result.success && result.newTraits) {
                                setSass(result.newTraits.sassLevel);
                                setEnergy(result.newTraits.energyLevel);
                                setNostalgia(result.newTraits.nostalgiaLevel);
                                alert("AI Learning Complete! Traits updated based on simulated performance.");
                            } else {
                                alert("Optimization failed.");
                            }
                        }}
                        style={{ float: "right", fontSize: "0.8rem", padding: "4px 8px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "4px", color: "#4ade80", cursor: "pointer" }}
                    >
                        Simulate Learning Loop ⚡
                    </button>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>Persona Name</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={initialData?.name || "Dom"}
                            style={{ width: "100%", padding: "var(--space-3)", borderRadius: "var(--radius-sm)", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-main)" }}
                        />
                    </div>

                    {/* Voice Settings (Hidden/Managed by AI) */}
                    <input type="hidden" name="voice" value="Dom (Soft-spoken Italian-American)" />

                    {/* Granular Personality Controls */}
                    <div>
                        <label style={{ display: "block", marginBottom: "var(--space-4)", fontWeight: 500 }}>Personality Tuning</label>

                        <div style={{ display: "grid", gap: "var(--space-6)" }}>
                            {/* Sass */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "var(--space-2)" }}>
                                    <span>Sass Level</span>
                                    <span style={{ color: "#4ade80" }}>{sass}/10</span>
                                </div>
                                <input
                                    type="range"
                                    name="sassLevel"
                                    min="1" max="10"
                                    value={sass}
                                    onChange={(e) => setSass(Number(e.target.value))}
                                    style={{ width: "100%", accentColor: "#4ade80" }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                    <span>Polite</span>
                                    <span>Roasted</span>
                                </div>
                            </div>

                            {/* Energy */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "var(--space-2)" }}>
                                    <span>Energy Level</span>
                                    <span style={{ color: "var(--color-primary-light)" }}>{energy}/10</span>
                                </div>
                                <input
                                    type="range"
                                    name="energyLevel"
                                    min="1" max="10"
                                    value={energy}
                                    onChange={(e) => setEnergy(Number(e.target.value))}
                                    style={{ width: "100%", accentColor: "var(--color-primary)" }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                    <span>Chill</span>
                                    <span>Hype</span>
                                </div>
                            </div>

                            {/* Nostalgia */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "var(--space-2)" }}>
                                    <span>Nostalgia Factor</span>
                                    <span style={{ color: "var(--color-accent)" }}>{nostalgia}/10</span>
                                </div>
                                <input
                                    type="range"
                                    name="nostalgiaLevel"
                                    min="1" max="10"
                                    value={nostalgia}
                                    onChange={(e) => setNostalgia(Number(e.target.value))}
                                    style={{ width: "100%", accentColor: "var(--color-accent)" }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                    <span>Modern</span>
                                    <span>"Back in my day..."</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Autopilot Settings */}
            <section className="card">
                <h2 style={{ fontSize: "1.25rem", marginBottom: "var(--space-6)", paddingBottom: "var(--space-4)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    Autopilot & Automation
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

                    {/* Master Toggle */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "var(--space-4)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 500 }}>Enable Autopilot</h3>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Allow Dom to generate and schedule content automatically.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" name="autopilotEnabled" defaultChecked={autopilot.enabled} style={{ accentColor: "#4ade80", transform: "scale(1.5)" }} />
                        </label>
                    </div>

                    {/* Posts Per Day Slider */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                            <div>
                                <h3 style={{ fontSize: "1rem", fontWeight: 500 }}>Daily Posting Frequency</h3>
                                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>How many videos should Dom generate per day?</p>
                            </div>
                            <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.9rem", fontWeight: "bold" }}>
                                {postsPerDay} / day
                            </span>
                        </div>
                        <input
                            type="range"
                            name="postsPerDay"
                            min="0" max="10"
                            value={postsPerDay}
                            onChange={(e) => setPostsPerDay(Number(e.target.value))}
                            style={{ width: "100%", accentColor: "var(--text-main)" }}
                        />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "var(--space-4)" }}>
                        <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 500 }}>Require Approval</h3>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Drafts must be manually approved before posting.</p>
                        </div>
                        <label className="switch">
                            <input type="checkbox" name="requireApproval" defaultChecked={autopilot.requireApproval} style={{ accentColor: "#4ade80", transform: "scale(1.5)" }} />
                        </label>
                    </div>
                </div>
            </section>

            <div style={{ display: "flex", justifyContent: "flex-end", position: "sticky", bottom: "20px" }}>
                <button type="submit" disabled={isPending} className="btn btn-primary" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                    {isPending ? "Saving..." : "Save Configuration"}
                </button>
            </div>

        </form >
    );
}
