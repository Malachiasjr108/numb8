
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - List all circle echoes
export async function GET() {
  try {
    const echoes = await prisma.circleEcho.findMany({
      orderBy: { echoNumber: "asc" },
    });

    const unlockedCount = echoes.filter((e) => e.unlocked).length;

    return NextResponse.json({
      echoes,
      total: echoes.length,
      unlocked: unlockedCount,
      locked: echoes.length - unlockedCount,
    });
  } catch (error) {
    console.error("Error fetching circle echoes:", error);
    return NextResponse.json(
      { error: "Failed to fetch circle echoes" },
      { status: 500 }
    );
  }
}

// POST - Update circle echo status
export async function POST(request: NextRequest) {
  try {
    const { echoNumber, unlocked } = await request.json();

    if (!echoNumber) {
      return NextResponse.json(
        { error: "Echo number is required" },
        { status: 400 }
      );
    }

    const echo = await prisma.circleEcho.upsert({
      where: { echoNumber: parseInt(echoNumber) },
      update: { unlocked },
      create: { echoNumber: parseInt(echoNumber), unlocked },
    });

    return NextResponse.json({
      success: true,
      echo,
      message: `Circle Echo ${echoNumber} ${unlocked ? "unlocked" : "locked"}`,
    });
  } catch (error) {
    console.error("Error updating circle echo:", error);
    return NextResponse.json(
      { error: "Failed to update circle echo" },
      { status: 500 }
    );
  }
}
