// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface GeneratedAsset {
    id: string;
    url: string;
    type: 'video' | 'image';
    status: 'completed';
}

export async function generateVideo(script: string): Promise<GeneratedAsset> {
    console.log("Generating video for script:", script.substring(0, 50) + "...");
    await delay(3000); // Simulate processing time

    return {
        id: Math.random().toString(36).substring(7),
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Placeholder video
        type: 'video',
        status: 'completed'
    };
}

export async function generateThumbnail(recipeName: string): Promise<GeneratedAsset> {
    await delay(1500);
    return {
        id: Math.random().toString(36).substring(7),
        url: "https://placehold.co/600x400/2a2a2a/FFF?text=" + encodeURIComponent(recipeName),
        type: 'image',
        status: 'completed'
    };
}
