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
export async function generateVideo(prompt: string) {
    try {
        // Using Krea Wan 14b model
        const result: any = await fal.subscribe("fal-ai/krea-wan-14b/text-to-video", {
            input: {
                prompt,
                aspect_ratio: "9:16" // Social media vertical default
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log("Fal Video Generation:", update.logs.map((log) => log.message));
                }
            },
        });

        if (result.video && result.video.url) {
            return { success: true, url: result.video.url };
        }
        return { success: false, error: "No video returned" };
    } catch (error: any) {
        console.error("Fal Video error:", error);
        return { success: false, error: error.message };
    }
}
