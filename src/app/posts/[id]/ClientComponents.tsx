"use client";

import { useTransition, useState } from "react";
import { cancelPost, updatePostScript, updatePostMedia } from "../actions";

export function MediaManager({ postId, contentId, url, type }: { postId: string, contentId: string, url: string, type: string }) {
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div style={{ marginBottom: "var(--space-6)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>Media Content</h3>

            <div style={{ position: "relative", marginBottom: "var(--space-4)", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-color)", background: "#000" }}>
                {type === 'VIDEO' ? (
                    <video src={url} controls style={{ width: "100%", maxHeight: "500px", display: "block" }} />
                ) : (
                    <img src={url} alt="Post Content" style={{ width: "100%", maxHeight: "500px", objectFit: "contain", display: "block" }} />
                )}
            </div>

            <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                <a
                    href={url}
                    download={`content-${contentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ textDecoration: "none", background: "var(--bg-paper)", border: "1px solid var(--border-color)" }}
                >
                    ⬇️ Download
                </a>

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn"
                    style={{ background: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)" }}
                >
                    🔁 Replace Media
                </button>
            </div>

            {isEditing && (
                <div style={{ marginTop: "var(--space-4)", padding: "var(--space-4)", background: "var(--bg-contrast)", borderRadius: "var(--radius-md)" }}>
                    <form action={(formData) => startTransition(async () => { await updatePostMedia(formData); setIsEditing(false); })}>
                        <input type="hidden" name="postId" value={postId} />
                        <input type="hidden" name="contentId" value={contentId} />

                        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                            <select
                                name="type"
                                defaultValue={type}
                                style={{ padding: "var(--space-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-paper)", color: "var(--text-main)" }}
                            >
                                <option value="IMAGE">Image</option>
                                <option value="VIDEO">Video</option>
                            </select>
                            <input
                                type="text"
                                name="url"
                                placeholder="https://..."
                                required
                                defaultValue={url}
                                style={{ flex: 1, padding: "var(--space-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-paper)", color: "var(--text-main)" }}
                            />
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <button type="submit" disabled={isPending} className="btn btn-primary">
                                {isPending ? "Saving..." : "Update Media"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export function EditScriptForm({ postId, contentId, initialScript }: { postId: string, contentId: string, initialScript: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <form action={(formData) => startTransition(async () => { await updatePostScript(formData); })}>
            <input type="hidden" name="postId" value={postId} />
            <input type="hidden" name="contentId" value={contentId} />
            <textarea
                name="script"
                defaultValue={initialScript}
                rows={10}
                style={{
                    width: "100%",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-contrast)",
                    color: "var(--text-main)",
                    fontFamily: "inherit",
                    lineHeight: "1.5",
                    marginBottom: "var(--space-4)",
                    opacity: isPending ? 0.7 : 1
                }}
            />
            <div style={{ textAlign: "right" }}>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}

export function CancelButton({ postId }: { postId: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <form action={(formData) => startTransition(async () => { await cancelPost(formData); })}>
            <input type="hidden" name="postId" value={postId} />
            <button
                type="submit"
                className="btn"
                disabled={isPending}
                style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid #ef4444", opacity: isPending ? 0.7 : 1 }}
            >
                {isPending ? "Cancelling..." : "Cancel Post"}
            </button>
        </form>
    );
}
