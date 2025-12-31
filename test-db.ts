
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Connecting to database...")
        // Try to query using the new field 'status'
        const posts = await prisma.post.findMany({
            where: {
                status: 'SCHEDULED'
            },
            take: 1
        })
        console.log("Successfully connected! Found posts with status SCHEDULED:", posts.length)
    } catch (e) {
        console.error("Database query failed:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
