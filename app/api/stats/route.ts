
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get all statistics
export async function GET() {
  try {
    const [portalTotal, circleTotal, infiniteTotal, usersTotal, imagesTotal] =
      await Promise.all([
        prisma.portalEcho.count({ where: { unlocked: true } }),
        prisma.circleEcho.count({ where: { unlocked: true } }),
        prisma.infiniteEcho.count({ where: { unlocked: true } }),
        prisma.user.count(),
        prisma.echoImage.count(),
      ]);

    return NextResponse.json({
      portal: {
        unlocked: portalTotal,
        total: 800,
        locked: 800 - portalTotal,
      },
      circle: {
        unlocked: circleTotal,
        total: 80,
        locked: 80 - circleTotal,
      },
      infinite: {
        unlocked: infiniteTotal,
        total: 8,
        locked: 8 - infiniteTotal,
      },
      users: usersTotal,
      images: imagesTotal,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
