import { fal } from "@fal-ai/client";

// Configure Fal with API Key (server-side only)
fal.config({
    credentials: process.env.FAL_KEY || "dummy-fal-key",
});

/**
 * Generate an image using a fast, high-quality model (FLUX or SDXL).
 * We use FLUX Realism as it pairs well with Krea's aesthetic.
 */
// Using the official Krea Flux model on Fal
export async function generateImage(prompt: string, aspectRatio: "16:9" | "9:16" | "1:1" = "16:9") {
    try {
        // Map abstract aspect ratios to specific pixel dimensions for Krea
        let imageSize = { width: 1344, height: 768 }; // 16:9 equivalent for ~1MP
        if (aspectRatio === "9:16") imageSize = { width: 768, height: 1344 };
        if (aspectRatio === "1:1") imageSize = { width: 1024, height: 1024 };

        console.log("Submitting Krea Image Request:", { prompt, imageSize });

        const result: any = await fal.subscribe("fal-ai/flux/krea", {
            input: {
                prompt,
                image_size: imageSize, // Use explicit dimensions
                num_inference_steps: 28,
                guidance_scale: 3.5,
                // safety_tolerance removed as it caused errors
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log("Fal Krea Generation:", update.logs.map((log) => log.message));
                }
            },
        });

        console.log("Fal Krea Result:", JSON.stringify(result));

        // Handle inconsistent API response structures (some wrap in 'data', some don't)
        const images = result.images || (result.data && result.data.images);

        if (images && images.length > 0) {
            return { success: true, url: images[0].url };
        }

        return { success: false, error: "No image returned. Result: " + JSON.stringify(result) };

    } catch (error: any) {
        console.error("Fal Image error:", error);
        return { success: false, error: error.message || String(error) };
    }
}

/**
 * Submit a video generation job (Async).
 * Uses Kling Video (via Fal) as the high-quality Krea alternative.
 * Returns requestId to check status later.
 */
export async function submitVideo(prompt: string, imageUrl?: string) {
    try {
        // User requested Krea for video (prioritizing quality over avatars)
        // Endpoint: fal-ai/krea-wan-14b/text-to-video
        // Note: For now we ignore imageUrl to ensure we use the specific Krea text model requested.
        const endpoint = "fal-ai/krea-wan-14b/text-to-video";

        const input: any = {
            prompt,
            aspect_ratio: "9:16",
            duration: 5
        };

        console.log("Submitting Krea Video (Wan 14b):", { prompt });

        const result = await fal.queue.submit(endpoint, { input });
        return { success: true, requestId: result.request_id };
    } catch (error: any) {
        console.error("Fal Submit error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Check the status of a video generation job.
 */
export async function checkVideoStatus(requestId: string, isImageToVideo: boolean = false) {
    // We check both queues to cover cases where we don't know the type,
    // prioritizing the most likely based on context if simpler, but here we just iterate.
    const endpoints = [
        "fal-ai/krea-wan-14b/text-to-video",
        "fal-ai/kling-video/v1/standard/text-to-video",
        "fal-ai/kling-video/v1/standard/image-to-video"
    ];

    for (const endpoint of endpoints) {
        try {
            const status = await fal.queue.status(endpoint, {
                requestId,
                logs: true
            });

            if (status) {
                if (status.status === "COMPLETED") {
                    const result: any = await fal.queue.result(endpoint, { requestId });

                    // Robust check for different response formats
                    // Krea often uses 'file' or 'url' at top level, Kling uses 'video.url'
                    // Also checking nested 'data' prop which is common in some Fal endpoints
                    const videoUrl =
                        result.video?.url ||
                        result.file?.url ||
                        result.url ||
                        (result.data && (result.data.video?.url || result.data.file?.url || result.data.url));

                    if (videoUrl) {
                        return { success: true, status: "COMPLETED", url: videoUrl };
                    }
                    console.error("Video Completed but no URL found. Result:", JSON.stringify(result));
                    return { success: false, error: "Completed but no URL returned" };
                }
                // If found and not completed, return status
                return { success: true, status: status.status };
            }
        } catch (e) {
            // endpoint mismatch likely throws error, continue to next
            continue;
        }
    }

    // If not found in either
    return { success: false, error: "Job not found in queues" };
}
