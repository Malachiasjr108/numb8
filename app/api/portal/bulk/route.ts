
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST - Bulk operations
export async function POST(request: NextRequest) {
  try {
    const { action, count } = await request.json();

    if (action === "unlockNext") {
      // Get all echoes
      const echoes = await prisma.portalEcho.findMany({
        orderBy: { echoNumber: "asc" },
      });

      // Find first N locked echoes
      const toUnlock = echoes
        .filter((e) => !e.unlocked)
        .slice(0, count || 111)
        .map((e) => e.echoNumber);

      // Bulk update
      await prisma.portalEcho.updateMany({
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
        message: `Unlocked ${toUnlock.length} portal echoes`,
      });
    } else if (action === "unlockAll") {
      const result = await prisma.portalEcho.updateMany({
        data: {
          unlocked: true,
        },
      });

      return NextResponse.json({
        success: true,
        unlocked: result.count,
        message: `Unlocked all ${result.count} portal echoes`,
      });
    } else if (action === "lockAll") {
      const result = await prisma.portalEcho.updateMany({
        data: {
          unlocked: false,
        },
      });

      return NextResponse.json({
        success: true,
        locked: result.count,
        message: `Locked all ${result.count} portal echoes`,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error bulk updating portal:", error);
    return NextResponse.json(
      { error: "Failed to bulk update portal" },
      { status: 500 }
    );
  }
}
