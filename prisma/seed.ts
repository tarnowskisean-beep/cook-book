import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const project = await prisma.project.create({
        data: {
            title: "Everybody and Their Mother's Cookbook - Vol 1",
            description: "The classics, just like Nonna used to make.",
            products: {
                create: [
                    {
                        name: "Sunday Gravy",
                        description: "Slow cooked meat sauce for pasta.",
                        features: JSON.stringify(["Pork Shoulder", "San Marzano Tomatoes", "Red Wine", "Basil"]),
                        usage: JSON.stringify(["Sear meat", "Simmer tomatoes for 4 hours", "Serve over rigatoni"]),
                        images: "[]",
                        background: "Nonna's secret recipe from Naples."
                    },
                    {
                        name: "Classic Meatballs",
                        description: "Beef and pork blend.",
                        features: JSON.stringify(["Ground Beef", "Ground Pork", "Breadcrumbs", "Parmesan"]),
                        usage: JSON.stringify(["Mix ingredients", "Roll into balls", "Fry in olive oil"]),
                        images: "[]",
                        background: "Perfected over 30 years of Sunday dinners."
                    }
                ]
            }
        }
    })
    console.log({ project })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
