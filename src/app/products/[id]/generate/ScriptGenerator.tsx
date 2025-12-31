"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveContent, schedulePost, generateScript, generateVideoAction } from '@/app/actions';

interface Props {
    productId: string;
    productName: string;
}

export default function ScriptGenerator({ productId, productName }: Props) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // State
    const [platforms, setPlatforms] = useState<string[]>(['Instagram']);
    const [script, setScript] = useState('');
    const [caption, setCaption] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const togglePlatform = (p: string) => {
        if (platforms.includes(p)) {
            if (platforms.length > 1) { // Prevent unselecting last one
                setPlatforms(platforms.filter(item => item !== p));
            }
        } else {
            setPlatforms([...platforms, p]);
        }
    };

    const handleGenerateScript = async () => {
        setLoading(true);
        try {
            const result = await generateScript(productId, platforms);

            if (result.success && result.script) {
                setScript(result.script);
                setCaption(`Check out the new ${productName}! 🚀 #innovation #product`);
                setStep(2);
            } else {
                alert("Failed to generate script. Please check API key.");
            }
        } catch (e) {
            console.error(e);
            alert("Error generating script");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateVideo = async () => {
        setLoading(true);
        try {
            const result = await generateVideoAction(script);
            if (result.success && result.url) {
                setVideoUrl(result.url);
                setStep(3);
            } else {
                alert("Failed to generate video: " + (result.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Error generating video");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAndSchedule = async () => {
        setSaving(true);
        try {
            const result = await saveContent(
                productId,
                'VIDEO',
                videoUrl,
                platforms,
                script
            );

            if (result.success && result.data) {
                const contentIds = result.data.map((c: any) => c.id);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                await schedulePost(contentIds, tomorrow.toISOString());

                alert(`Content saved and scheduled for ${platforms.length} platforms!`);
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
                {['Configuration', 'Script Review', 'Preview & Save'].map((label, i) => (
                    <div key={label} style={{ color: step > i ? "#4ade80" : step === i + 1 ? "var(--color-primary-light)" : "var(--text-muted)", fontWeight: step === i + 1 ? 600 : 400 }}>
                        {i + 1}. {label}
                    </div>
                ))}
            </div>

            {loading && (
                <div style={{ textAlign: "center", padding: "var(--space-12)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "var(--space-4)", animation: "spin 1s linear infinite" }}>⏳</div>
                    <p>Generating...</p>
                </div>
            )}

            {!loading && step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                    <h2 style={{ fontSize: "1.5rem" }}>Content Settings</h2>

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
