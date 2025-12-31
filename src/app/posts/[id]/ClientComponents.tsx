"use client";

import { useTransition, useState } from "react";
import { cancelPost, updatePostScript } from "../actions";

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
