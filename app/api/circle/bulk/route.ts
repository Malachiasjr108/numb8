
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST - Bulk operations
export async function POST(request: NextRequest) {
  try {
    const { action, count } = await request.json();

    if (action === "unlockNext") {
      const echoes = await prisma.circleEcho.findMany({
        orderBy: { echoNumber: "asc" },
      });

      const toUnlock = echoes
        .filter((e) => !e.unlocked)
        .slice(0, count || 10)
        .map((e) => e.echoNumber);

      await prisma.circleEcho.updateMany({
        where: {
          echoNumber: {
            in: toUnlock,
          },
        },
        data: {
          unlocked: true,
        },
      });

      return NextResponse.json({
        success: true,
        unlocked: toUnlock.length,
        message: `Unlocked ${toUnlock.length} circle echoes`,
      });
    } else if (action === "unlockAll") {
      const result = await prisma.circleEcho.updateMany({
        data: {
          unlocked: true,
        },
      });

      return NextResponse.json({
        success: true,
        unlocked: result.count,
        message: `Unlocked all ${result.count} circle echoes`,
      });
    } else if (action === "lockAll") {
      const result = await prisma.circleEcho.updateMany({
        data: {
          unlocked: false,
        },
      });

      return NextResponse.json({
        success: true,
        locked: result.count,
        message: `Locked all ${result.count} circle echoes`,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error bulk updating circle:", error);
    return NextResponse.json(
      { error: "Failed to bulk update circle" },
      { status: 500 }
    );
  }
}
