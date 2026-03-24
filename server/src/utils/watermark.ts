import sharp from "sharp";

/**
 * Görsele "TrucksBus.com" filigranı ekler.
 * - Kırmızı, bold, çapraz (-35°), şeffaf (%18 opacity)
 * - Boyut görsele orantılı (width / 12)
 * - Tüm yüklenen görsellere ZORUNLU uygulanır, bypass yok.
 */
export const applyWatermark = async (
    inputBuffer: Buffer,
): Promise<Buffer> => {
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    const width = metadata.width || 800;
    const height = metadata.height || 600;

    const fontSize = Math.floor(width / 12);

    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .wm {
          fill: red;
          font-size: ${fontSize}px;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: bold;
          opacity: 0.18;
        }
      </style>
      <g transform="rotate(-35 ${width / 2} ${height / 2})">
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="wm">
          TrucksBus.com
        </text>
      </g>
    </svg>
  `;

    return await image
        .composite([
            {
                input: Buffer.from(svg),
                gravity: "center",
            },
        ])
        .jpeg({ quality: 85 })
        .toBuffer();
};

/**
 * Multer file buffer'ına filigran ekleyip base64 data URI döndürür.
 * image/* → filigran uygulanır + JPEG olarak çıkar
 * diğer tipler → olduğu gibi base64 döner (video, PDF vs.)
 */
export async function toBase64WithWatermark(
    buffer: Buffer,
    mimetype: string,
): Promise<string> {
    if (mimetype.startsWith("image/")) {
        const watermarked = await applyWatermark(buffer);
        return `data:image/jpeg;base64,${watermarked.toString("base64")}`;
    }
    return `data:${mimetype};base64,${buffer.toString("base64")}`;
}
