
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST - Bulk operations
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "unlockAll") {
      const result = await prisma.infiniteEcho.updateMany({
        data: {
          unlocked: true,
        },
      });

      return NextResponse.json({
        success: true,
        unlocked: result.count,
        message: `Unlocked all ${result.count} infinite echoes`,
      });
    } else if (action === "lockAll") {
      const result = await prisma.infiniteEcho.updateMany({
        data: {
          unlocked: false,
        },
      });

      return NextResponse.json({
        success: true,
        locked: result.count,
        message: `Locked all ${result.count} infinite echoes`,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error bulk updating infinite:", error);
    return NextResponse.json(
      { error: "Failed to bulk update infinite" },
      { status: 500 }
    );
  }
}
