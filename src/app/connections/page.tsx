import prisma from '@/lib/prisma';
import ConnectionCard from '@/components/ConnectionCard';

export const dynamic = 'force-dynamic';

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E1306C' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
    { id: 'twitter', name: 'Twitter / X', icon: '🐦', color: '#1DA1F2' },
];

export default async function ConnectionsPage() {
    const accounts = await prisma.socialAccount.findMany();

    return (
        <>
            <header style={{ marginBottom: "var(--space-8)" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>Connections</h1>
                <p style={{ color: "var(--text-muted)" }}>Manage your social media accounts and integrations.</p>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                {PLATFORMS.map((platform) => {
                    const isConnected = accounts.some(a => a.platform === platform.id);

                    return (
                        <ConnectionCard key={platform.id} platform={platform} isConnected={isConnected} />
                    );
                })}
            </div>
        </>
    );
}
