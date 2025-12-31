import { fal } from "@fal-ai/client";

// Configure Fal with API Key (server-side only)
fal.config({
    credentials: process.env.FAL_KEY || "dummy-fal-key",
});

/**
 * Generate an image using a fast, high-quality model (FLUX or SDXL).
 * We use FLUX Realism as it pairs well with Krea's aesthetic.
 */
export async function generateImage(prompt: string, aspectRatio: "16:9" | "9:16" | "1:1" = "16:9") {
    try {
        // Using the official Krea Flux model on Fal
        const result: any = await fal.subscribe("fal-ai/flux/krea", {
            input: {
                prompt,
                image_size: aspectRatio === "16:9" ? "landscape_16_9" : aspectRatio === "9:16" ? "portrait_16_9" : "square_hd",
                num_inference_steps: 28, // Krea recommended steps often around 25-30
                guidance_scale: 3.5
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log("Fal Krea Generation: ", update.logs.map((log) => log.message));
                }
            },
        });

        if (result.images && result.images.length > 0) {
            return { success: true, url: result.images[0].url };
        }
        return { success: false, error: "No image returned" };
    } catch (error: any) {
        console.error("Fal Image error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Submit a video generation job (Async).
 * Uses Kling Video (via Fal) as the high-quality Krea alternative.
 * Returns requestId to check status later.
 */
export async function submitVideo(prompt: string, imageUrl?: string) {
    try {
        // Kling Standard Endpoints
        const endpoint = imageUrl
            ? "fal-ai/kling-video/v1/standard/image-to-video"
            : "fal-ai/kling-video/v1/standard/text-to-video";

        const input: any = {
            prompt,
            aspect_ratio: "9:16", // vertical video for social
            duration: "5s"
        };

        if (imageUrl) {
            input.image_url = imageUrl;
        }

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
                    if (result.video && result.video.url) {
                        return { success: true, status: "COMPLETED", url: result.video.url };
                    }
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
