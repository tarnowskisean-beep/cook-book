"use client";

import { createProject, updateProject, deleteProject } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Persona {
    id: string;
    name: string;
}

interface Project {
    id: string;
    title: string;
    description: string | null;
    personaId: string | null;
    isAutopilot: boolean;
    autopilotConfig: string | null; // JSON string
}

interface Props {
    personas: Persona[];
    project?: Project; // If provided, we are in Edit mode
}

export default function ProjectForm({ personas, project }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!project;

    // Parse autopilot config if editing
    const defaultPostsPerDay = project?.autopilotConfig
        ? JSON.parse(project.autopilotConfig).postsPerDay
        : 1;

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            if (isEdit && project) {
                const result = await updateProject(project.id, formData);
                if (result.success) {
                    router.push(`/projects/${project.id}`);
                } else {
                    setError(result.error || "Update failed");
                }
            } else {
                const result = await createProject(formData);
                if (result.success && result.projectId) {
                    router.push(`/projects/${result.projectId}`);
                } else {
                    setError(result.error || "Creation failed");
                }
            }
        });
    };

    const handleDelete = async () => {
        if (!project) return;
        if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

        startTransition(async () => {
            const result = await deleteProject(project.id);
            if (result.success) {
                router.push('/projects');
            } else {
                setError(result.error || "Failed to delete project");
            }
        });
    };

    return (
        <div className="card">
            {isEdit && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Edit Project</h2>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="btn"
                        style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 12px', fontSize: '0.9rem' }}
                    >
                        🗑️ Delete Project
                    </button>
                </div>
            )}

            <form action={handleSubmit}>
                <div style={{ marginBottom: "var(--space-6)" }}>
                    <label htmlFor="title" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Project Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        defaultValue={project?.title}
                        placeholder="e.g. Summer Grilling 2025"
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-contrast)",
                            color: "var(--text-main)",
                            fontSize: "1rem"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "var(--space-6)" }}>
                    <label htmlFor="personaId" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Assign Persona (Who writes this?)
                    </label>
                    <select
                        id="personaId"
                        name="personaId"
                        defaultValue={project?.personaId || ""}
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-contrast)",
                            color: "var(--text-main)",
                            fontSize: "1rem"
                        }}
                    >
                        <option value="">No specific persona (Default)</option>
                        {personas.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: "var(--space-6)" }}>
                    <label htmlFor="description" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        defaultValue={project?.description || ""}
                        placeholder="What's this cookbook about?"
                        style={{
                            width: "100%",
                            padding: "var(--space-3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-contrast)",
                            color: "var(--text-main)",
                            fontSize: "1rem",
                            fontFamily: "inherit"
                        }}
                    />
                </div>

                <div className="card" style={{ marginBottom: "var(--space-6)", background: "var(--bg-contrast)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                        <label htmlFor="isAutopilot" style={{ fontWeight: 600, fontSize: "1rem" }}>
                            🚀 Enable Autopilot?
                        </label>
                        <input
                            type="checkbox"
                            id="isAutopilot"
                            name="isAutopilot"
                            defaultChecked={project?.isAutopilot}
                            style={{ width: "20px", height: "20px" }}
                            onChange={(e) => {
                                const input = document.getElementById('postsPerDayContainer');
                                if (input) input.style.display = e.target.checked ? 'block' : 'none';
                            }}
                        />
                    </div>

                    <div id="postsPerDayContainer" style={{ display: project?.isAutopilot ? "block" : "none" }}>
                        <label htmlFor="postsPerDay" style={{ display: "block", marginBottom: "var(--space-2)", fontWeight: 500 }}>
                            Posts Per Day
                        </label>
                        <input
                            type="number"
                            id="postsPerDay"
                            name="postsPerDay"
                            defaultValue={defaultPostsPerDay}
                            min={1}
                            max={10}
                            style={{
                                width: "100%",
                                padding: "var(--space-3)",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border-color)",
                                background: "var(--bg-paper)",
                                color: "var(--text-main)",
                                fontSize: "1rem"
                            }}
                        />
                    </div>
                </div>

                {error && (
                    <div style={{ marginBottom: "var(--space-4)", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", gap: "var(--space-4)" }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn"
                        style={{ background: "transparent", border: "1px solid var(--border-color)" }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                    >
                        {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Project")}
                    </button>
                </div>
            </form>
        </div>
    );
}
