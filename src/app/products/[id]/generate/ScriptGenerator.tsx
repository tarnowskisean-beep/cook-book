"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveContent, schedulePost, generateScript, submitVideoAction, checkVideoStatusAction } from '@/app/actions';

interface Props {
    productId: string;
    productName: string;
}

export default function ScriptGenerator({ productId, productName }: Props) {
    const router = useRouter();
    const [statusMessage, setStatusMessage] = useState<string>("");

    // ... (existing code)

    const handleGenerateVideo = async () => {
        setLoading(true);
        setStatusMessage("Submitting job to Krea/Fal...");
        try {
            // 1. Submit Job
            const submitResult = await submitVideoAction(script);
            if (!submitResult.success || !submitResult.requestId) {
                alert("Failed to start video generation: " + (submitResult.error || "Unknown error"));
                setLoading(false);
                return;
            }

            const requestId = submitResult.requestId;
            setStatusMessage("Job submitted. Waiting for processing...");

            // 2. Poll for Status
            const pollInterval = setInterval(async () => {
                try {
                    const statusResult = await checkVideoStatusAction(requestId);

                    if (!statusResult.success) {
                        clearInterval(pollInterval);
                        setLoading(false);
                        alert("Video generation error: " + statusResult.error);
                        return;
                    }

                    if (statusResult.status === "COMPLETED" && statusResult.url) {
                        clearInterval(pollInterval);
                        setVideoUrl(statusResult.url);
                        setStep(3);
                        setLoading(false);
                    } else if (statusResult.status === "FAILED" || statusResult.status === "CANCELLED") {
                        clearInterval(pollInterval);
                        setLoading(false);
                        alert("Video generation failed.");
                    } else {
                        // Else: IN_PROGRESS or QUEUED
                        setStatusMessage(`Status: ${statusResult.status} (Please wait, video takes ~2 mins)...`);
                        console.log("Polling video status:", statusResult.status);
                    }

                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 3000); // Check every 3 seconds

        } catch (e) {
            console.error(e);
            alert("Error initiating video generation");
            setLoading(false);
        }
    };

    // ... (existing code)

    return (
        <div className="card" style={{ maxWidth: "800px", minHeight: "600px" }}>
            {/* ... */}

            {loading && (
                <div style={{ textAlign: "center", padding: "var(--space-12)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "var(--space-4)", animation: "spin 1s linear infinite" }}>⏳</div>
                    <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>Generating...</p>
                    <p style={{ color: "var(--text-muted)", marginTop: "var(--space-2)" }}>{statusMessage}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "var(--space-4)", maxWidth: "400px", marginInline: "auto" }}>
                        Note: Krea Video generation is complex and takes time.
                        Usage logs will appear in your <strong>Fal.ai</strong> dashboard.
                    </p>
                </div>
            )}


            {!loading && step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                    <h2 style={{ fontSize: "1.5rem" }}>Content Settings <span style={{ fontSize: "0.8rem", color: "#666" }}>(v2.0)</span></h2>

                    <div>
                        <label style={{ display: "block", marginBottom: "var(--space-2)" }}>Target Platforms</label>
                        <div style={{ display: "flex", gap: "var(--space-4)" }}>
                            {['Instagram', 'TikTok', 'Facebook', 'Twitter / X'].map(p => {
                                const isSelected = platforms.includes(p);
                                return (
                                    <button
                                        key={p}
                                        onClick={() => togglePlatform(p)}
                                        style={{
                                            padding: "var(--space-3) var(--space-4)",
                                            borderRadius: "var(--radius-md)",
                                            border: isSelected ? "2px solid var(--color-primary)" : "1px solid rgba(255,255,255,0.1)",
                                            background: isSelected ? "rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.2)" : "transparent",
                                            color: "var(--text-main)",
                                            cursor: "pointer",
                                            position: "relative"
                                        }}
                                    >
                                        {isSelected && <span style={{ position: "absolute", top: -8, right: -8, background: "#4ade80", color: "#000", borderRadius: "50%", width: "20px", height: "20px", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ marginTop: "var(--space-4)" }}>
                        <button onClick={handleGenerateScript} className="btn btn-primary" style={{ width: "100%" }}>Generate Script</button>
                    </div>
                </div>
            )}

            {!loading && step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                    <h2 style={{ fontSize: "1.5rem" }}>Review Script</h2>

                    <div>
                        <label style={{ display: "block", marginBottom: "var(--space-2)" }}>Voiceover Script (Optimized for {platforms.join(', ')})</label>
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            style={{ width: "100%", height: "200px", padding: "var(--space-4)", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--text-main)", fontFamily: "monospace" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "var(--space-2)" }}>Suggested Caption</label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            style={{ width: "100%", height: "100px", padding: "var(--space-4)", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--text-main)" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "var(--space-4)" }}>
                        <button onClick={() => setStep(1)} className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>Back</button>
                        <button onClick={handleGenerateVideo} className="btn btn-primary" style={{ flex: 1 }}>Generate Video (Krea AI)</button>
                    </div>
                </div>
            )}

            {!loading && step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                    <h2 style={{ fontSize: "1.5rem" }}>Preview Content</h2>

                    <div style={{ aspectRatio: "16/9", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                        <video src={videoUrl} controls style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    </div>

                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center" }}>
                        Will be scheduled on: <strong style={{ color: "#fff" }}>{platforms.join(', ')}</strong>
                    </div>

                    <div style={{ display: "flex", gap: "var(--space-4)" }}>
                        <button onClick={() => setStep(2)} className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>Back</button>
                        <button onClick={handleSaveAndSchedule} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                            {saving ? "Saving..." : "Save & Schedule (Tomorrow)"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
