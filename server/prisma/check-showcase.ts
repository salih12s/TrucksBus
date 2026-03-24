import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const ads = await prisma.ad.findMany({
        where: {
            OR: [
                { title: { contains: "Deneme" } },
                { title: { contains: "ÖRNEK" } },
                { title: { contains: "deneme" } },
            ],
        },
        select: {
            id: true,
            title: true,
            images: {
                select: {
                    id: true,
                    isPrimary: true,
                    isShowcase: true,
                    imageUrl: true,
                },
            },
        },
    });
    for (const ad of ads) {
        console.log("Ad ID:", ad.id, "|", ad.title);
        console.log("  Image count:", ad.images.length);
        for (const img of ad.images) {
            // Check if image contains watermark SVG markers
            const hasWatermark = img.imageUrl.length > 1000; // watermarked images are larger
            console.log(
                "  Image ID:", img.id,
                "| isPrimary:", img.isPrimary,
                "| isShowcase:", img.isShowcase,
                "| url length:", img.imageUrl.length,
            );
        }
    }

    // Also show total counts
    const total = await prisma.adImage.count();
    console.log("\nTotal images in DB:", total);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
