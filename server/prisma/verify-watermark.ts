import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
    // Get primary images from the two problematic ads
    const ads = await prisma.ad.findMany({
        where: { id: { in: [195, 199, 200, 201] } },
        select: {
            id: true,
            title: true,
            images: {
                where: { isPrimary: true },
                take: 1,
                select: { id: true, imageUrl: true },
            },
        },
    });

    const outDir = path.join(__dirname, "test-images");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    for (const ad of ads) {
        if (ad.images.length === 0) {
            console.log(`Ad ${ad.id} (${ad.title}): NO PRIMARY IMAGE`);
            continue;
        }
        const img = ad.images[0];
        const match = img.imageUrl.match(/^data:(image\/([^;]+));base64,(.+)$/);
        if (!match) {
            console.log(`Ad ${ad.id} (${ad.title}): NOT base64, url starts with: ${img.imageUrl.substring(0, 50)}`);
            continue;
        }
        const ext = match[2] === "jpeg" ? "jpg" : match[2];
        const buffer = Buffer.from(match[3], "base64");
        const filePath = path.join(outDir, `ad_${ad.id}_img_${img.id}.${ext}`);
        fs.writeFileSync(filePath, buffer);
        console.log(`Ad ${ad.id} (${ad.title}): Image ${img.id} saved -> ${filePath} (${buffer.length} bytes)`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
