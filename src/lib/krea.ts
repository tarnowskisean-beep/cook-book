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
        const result: any = await fal.subscribe("fal-ai/flux-realism", {
            input: {
                prompt,
                image_size: aspectRatio === "16:9" ? "landscape_16_9" : aspectRatio === "9:16" ? "portrait_16_9" : "square_hd",
                num_inference_steps: 25,
                guidance_scale: 3.5
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log("Fal Image Generation: ", update.logs.map((log) => log.message));
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
 * Generate a video using Krea's model (Wan-14b via Fal).
 * This supports Text-to-Video.
 */
/**
 * Submit a video generation job (Async).
 * Returns requestId to check status later.
 */
export async function submitVideo(prompt: string, imageUrl?: string) {
    try {
        const endpoint = imageUrl ? "fal-ai/krea-wan-14b/image-to-video" : "fal-ai/krea-wan-14b/text-to-video";

        const input: any = {
            prompt,
            width: 720,
            height: 1280
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
    const endpoint = isImageToVideo ? "fal-ai/krea-wan-14b/image-to-video" : "fal-ai/krea-wan-14b/text-to-video";
    try {
        const status = await fal.queue.status(endpoint, {
            requestId,
            logs: true
        });

        if (status.status === "COMPLETED") {
            const result: any = await fal.queue.result(endpoint, { requestId });
            if (result.video && result.video.url) {
                return { success: true, status: "COMPLETED", url: result.video.url };
            }
        }
        return { success: true, status: status.status };
    } catch (error: any) {
        console.error("Fal Status error:", error);
        return { success: false, error: error.message };
    }
}
