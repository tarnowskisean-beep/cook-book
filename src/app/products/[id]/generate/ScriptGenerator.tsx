"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveContent, schedulePost, generateMediaPrompt, submitVideoAction, checkVideoStatusAction, generateImageAction } from '@/app/actions';

interface Props {
    productId: string;
    productName: string;
}

type MediaType = 'IMAGE' | 'VIDEO';

export default function ScriptGenerator({ productId, productName }: Props) {
    const router = useRouter();

    // UI State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>("");

    // Data State
    const [mediaType, setMediaType] = useState<MediaType>('VIDEO');
    const [platforms, setPlatforms] = useState<string[]>(['Instagram']);

    // Content State
    const [visualPrompt, setVisualPrompt] = useState('');
    const [caption, setCaption] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState('');

    const togglePlatform = (p: string) => {
        if (platforms.includes(p)) {
            if (platforms.length > 1) {
                setPlatforms(platforms.filter(item => item !== p));
            }
        } else {
            setPlatforms([...platforms, p]);
        }
    };

    const handleGeneratePrompt = async () => {
        setLoading(true);
        setStatusMessage("Designing visual concept & script...");
        try {
            const result = await generateMediaPrompt(productId, mediaType, platforms);

            if (result.success && result.prompt) {
                setVisualPrompt(result.prompt);
                setCaption(result.caption || "");
                setStep(2);
            } else {
                alert("Generation failed: " + (result.error || "Unknown error"));
            }
        } catch (e: any) {
            console.error(e);
            alert("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateContent = async () => {
        setLoading(true);
        setGeneratedUrl("");

        if (mediaType === 'IMAGE') {
            setStatusMessage("Generating Image with Krea AI...");
            try {
                const result = await generateImageAction(visualPrompt);
                if (result.success && result.url) {
                    setGeneratedUrl(result.url);
                    setStep(3);
                } else {
                    alert("Image generation failed: " + result.error);
                }
            } catch (e: any) {
                alert("Error: " + e.message);
            } finally {
                setLoading(false);
            }

        } else {
            // VIDEO
            setStatusMessage("Submitting Video Job to Kling AI...");
            try {
                const submitResult = await submitVideoAction(visualPrompt, productId);
                if (!submitResult.success || !submitResult.requestId) {
                    alert("Failed to start video generation: " + (submitResult.error || "Unknown error"));
                    setLoading(false);
                    return;
                }

                const requestId = submitResult.requestId;
                setStatusMessage("Job submitted. Waiting for Kling...");

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
                            setGeneratedUrl(statusResult.url);
                            setStep(3);
                            setLoading(false);
                        } else if (statusResult.status === "FAILED" || statusResult.status === "CANCELLED") {
                            clearInterval(pollInterval);
                            setLoading(false);
                            alert("Video generation failed.");
                        } else {
                            setStatusMessage(`Status: ${statusResult.status} (Avg wait: 2-3 mins)...`);
                        }
                    } catch (e) {
                        console.error("Polling error", e);
                    }
                }, 4000);

            } catch (e) {
                console.error(e);
                alert("Error initiating video generation");
                setLoading(false);
            }
        }
    };

    const handleSaveAndSchedule = async () => {
        setSaving(true);
        try {
            const result = await saveContent(
                productId,
                mediaType,
                generatedUrl,
                platforms,
                caption
            );

            if (result.success && result.data) {
                const contentIds = result.data.map((c: any) => c.id);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                await schedulePost(contentIds, tomorrow.toISOString());

                alert(`Content saved and scheduled!`);
                router.push(`/products/${productId}`);
            } else {
                alert("Failed to save content.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: "800px", minHeight: "600px" }}>
            {/* Progress Stepper */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-8)", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "var(--space-4)" }}>
                {['Setup', 'Review', 'Preview'].map((label, i) => (
                    <div key={label} style={{ color: step > i ? "#4ade80" : step === i + 1 ? "var(--color-primary-light)" : "var(--text-muted)", fontWeight: step === i + 1 ? 600 : 400 }}>
                        {i + 1}. {label}
                    </div>
                ))}
            </div>

            {loading && (
                <div style={{ textAlign: "center", padding: "var(--space-12)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "var(--space-4)", animation: "spin 1s linear infinite" }}>⏳</div>
                    <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>Working...</p>
                    <p style={{ color: "var(--text-muted)", marginTop: "var(--space-2)" }}>{statusMessage}</p>
                </div>
            )}

            {!loading && step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                    {/* Media Selection */}
                    <div>
                        <label style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>Content Type</label>
                        <div style={{ display: "flex", gap: "var(--space-4)" }}>
                            <button
                                onClick={() => setMediaType('VIDEO')}
                                style={{
                                    flex: 1,
                                    padding: "var(--space-4)",
                                    borderRadius: "var(--radius-md)",
                                    border: mediaType === 'VIDEO' ? "2px solid var(--color-primary)" : "1px solid var(--border-color)",
                                    background: mediaType === 'VIDEO' ? "rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)" : "var(--bg-paper)",
                                    cursor: "pointer",
                                    textAlign: "center"
                                }}
                            >
                                <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "4px" }}>🎬</span>
                                <span style={{ fontWeight: 600 }}>Video</span>
                            </button>
                            <button
                                onClick={() => setMediaType('IMAGE')}
                                style={{
                                    flex: 1,
                                    padding: "var(--space-4)",
                                    borderRadius: "var(--radius-md)",
                                    border: mediaType === 'IMAGE' ? "2px solid var(--color-primary)" : "1px solid var(--border-color)",
                                    background: mediaType === 'IMAGE' ? "rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)" : "var(--bg-paper)",
                                    cursor: "pointer",
                                    textAlign: "center"
                                }}
                            >
                                <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "4px" }}>📸</span>
                                <span style={{ fontWeight: 600 }}>Image</span>
                            </button>
                        </div>
                    </div>

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
                        <button onClick={handleGeneratePrompt} className="btn btn-primary" style={{ width: "100%" }}>
                            Next: Generate Concept
                        </button>
                    </div>
                </div>
            )}

            {!loading && step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                    <h2 style={{ fontSize: "1.5rem" }}>Review Concept</h2>

                    <div>
                        <label style={{ display: "block", marginBottom: "var(--space-2)" }}>
                            AI Visual Prompt ({mediaType === 'VIDEO' ? 'Kling Video' : 'Krea Image'})
                        </label>
                        <textarea
                            value={visualPrompt}
                            onChange={(e) => setVisualPrompt(e.target.value)}
                            style={{ width: "100%", height: "120px", padding: "var(--space-4)", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--text-main)", fontFamily: "monospace" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "var(--space-2)" }}>
                            {mediaType === 'VIDEO' ? 'Voiceover / Caption' : 'Caption'}
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            style={{ width: "100%", height: "100px", padding: "var(--space-4)", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", color: "var(--text-main)" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "var(--space-4)" }}>
                        <button onClick={() => setStep(1)} className="btn" style={{ background: "rgba(255,255,255,0.1)" }}>Back</button>
                        <button
                            onClick={handleGeneratePrompt}
                            className="btn"
                            style={{ background: "transparent", border: "1px solid var(--color-primary)", color: "var(--color-primary)" }}
                        >
                            🔄 Regenerate
                        </button>
                        <button onClick={handleGenerateContent} className="btn btn-primary" style={{ flex: 1 }}>
                            Generate {mediaType === 'VIDEO' ? 'Video' : 'Image'}
                        </button>
                    </div>
                </div>
            )}

            {!loading && step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                    <h2 style={{ fontSize: "1.5rem" }}>Preview Content</h2>

                    <div style={{ aspectRatio: mediaType === 'VIDEO' ? "9/16" : "16/9", maxHeight: "500px", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", overflow: "hidden", marginInline: "auto", width: "100%" }}>
                        {mediaType === 'VIDEO' ? (
                            <video src={generatedUrl} controls autoPlay loop style={{ maxWidth: "100%", maxHeight: "100%" }} />
                        ) : (
                            <img src={generatedUrl} alt="Generated" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        )}
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
