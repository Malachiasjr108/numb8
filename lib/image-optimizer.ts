
import sharp from "sharp";

export async function optimizeImage(
  buffer: Buffer,
  maxWidth: number = 400,
  maxHeight: number = 400
): Promise<Buffer> {
  return await sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 85 })
    .toBuffer();
}

export function generateEchoFileName(echoNumber: number): string {
  return `echo-${echoNumber}-${Date.now()}.webp`;
}
