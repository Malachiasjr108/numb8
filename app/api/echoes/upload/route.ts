
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/s3";
import { optimizeImage, generateEchoFileName } from "@/lib/image-optimizer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const echoNumber = formData.get("echoNumber") as string;

    if (!file || !echoNumber) {
      return NextResponse.json(
        { error: "File and echo number are required" },
        { status: 400 }
      );
    }

    const echoNum = parseInt(echoNumber, 10);
    if (isNaN(echoNum) || echoNum < 1 || echoNum > 888) {
      return NextResponse.json(
        { error: "Echo number must be between 1 and 888" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize image
    const optimizedBuffer = await optimizeImage(buffer);

    // Generate filename and upload to S3
    const fileName = generateEchoFileName(echoNum);
    const cloudStoragePath = await uploadFile(
      optimizedBuffer,
      fileName,
      "image/webp"
    );

    // Return the path - client will save to Firestore
    return NextResponse.json({
      success: true,
      echoNumber: echoNum,
      cloudStoragePath,
      message: "Image uploaded to cloud storage successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
