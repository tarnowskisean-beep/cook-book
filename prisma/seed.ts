import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const project = await prisma.project.create({
        data: {
            title: "Everybody and Their Mother's Cookbook - Vol 1",
            description: "The classics, just like Nonna used to make.",
            recipes: {
                create: [
                    {
                        name: "Sunday Gravy (Meat Sauce)",
                        description: "A rich, slow-cooked tomato sauce with pork ribs and meatballs.",
                        ingredients: JSON.stringify([
                            { item: "Pork Ribs", amount: "1 lb" },
                            { item: "Ground Beef", amount: "1 lb" },
                            { item: "San Marzano Tomatoes", amount: "2 cans" }
                        ]),
                        instructions: JSON.stringify([
                            "Brown the ribs.",
                            "Make meatballs.",
                            "Simmer sauce for 4 hours."
                        ]),
                        images: "[]"
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
