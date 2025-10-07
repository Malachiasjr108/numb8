
import { NextResponse } from "next/server";
import { getFileUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { images } = await request.json();
    
    // Generate signed URLs for all images
    const imagesWithUrls = await Promise.all(
      images.map(async (img: any) => ({
        echoNumber: img.echoNumber,
        imageUrl: await getFileUrl(img.cloudStoragePath),
        uploadedAt: img.uploadedAt,
      }))
    );

    return NextResponse.json({
      total: imagesWithUrls.length,
      images: imagesWithUrls,
    });
  } catch (error) {
    console.error("Error generating URLs:", error);
    return NextResponse.json(
      { error: "Failed to generate image URLs" },
      { status: 500 }
    );
  }
}
