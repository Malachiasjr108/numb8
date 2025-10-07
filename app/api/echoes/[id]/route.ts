
import { NextRequest, NextResponse } from "next/server";
import { getFileUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { cloudStoragePath } = await request.json();

    if (!cloudStoragePath) {
      return NextResponse.json(
        { error: "Cloud storage path required" },
        { status: 400 }
      );
    }

    // Generate signed URL from S3
    const imageUrl = await getFileUrl(cloudStoragePath);

    return NextResponse.json({
      imageUrl,
      success: true,
    });
  } catch (error) {
    console.error("Error generating URL:", error);
    return NextResponse.json(
      { error: "Failed to generate image URL" },
      { status: 500 }
    );
  }
}
