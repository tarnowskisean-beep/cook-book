// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SocialMetrics {
    views: number;
    likes: number;
    comments: number;
    shares: number;
}

export async function postContent(platform: string, contentUrl: string, caption: string): Promise<string> {
    console.log(`[Mock Social] Posting to ${platform}:`, { contentUrl, caption });
    await delay(2000); // Simulate API latency

    // Return a fake platform post ID
    return `${platform.toLowerCase().replace(/\s+/g, '_')}_post_${Math.random().toString(36).substring(7)}`;
}

export async function getAnalytics(platformPostId: string): Promise<SocialMetrics> {
    await delay(1000);

    // Return random metrics
    return {
        views: Math.floor(Math.random() * 50000) + 1000,
        likes: Math.floor(Math.random() * 5000) + 100,
        comments: Math.floor(Math.random() * 200) + 5,
        shares: Math.floor(Math.random() * 1000) + 20
    };
}
