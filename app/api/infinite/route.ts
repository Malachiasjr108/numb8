
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - List all infinite echoes
export async function GET() {
  try {
    const echoes = await prisma.infiniteEcho.findMany({
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
    console.error("Error fetching infinite echoes:", error);
    return NextResponse.json(
      { error: "Failed to fetch infinite echoes" },
      { status: 500 }
    );
  }
}

// POST - Update infinite echo status
export async function POST(request: NextRequest) {
  try {
    const { echoNumber, unlocked } = await request.json();

    if (!echoNumber) {
      return NextResponse.json(
        { error: "Echo number is required" },
        { status: 400 }
      );
    }

    const echo = await prisma.infiniteEcho.upsert({
      where: { echoNumber: parseInt(echoNumber) },
      update: { unlocked },
      create: { echoNumber: parseInt(echoNumber), unlocked },
    });

    return NextResponse.json({
      success: true,
      echo,
      message: `Infinite Echo ${echoNumber} ${unlocked ? "unlocked" : "locked"}`,
    });
  } catch (error) {
    console.error("Error updating infinite echo:", error);
    return NextResponse.json(
      { error: "Failed to update infinite echo" },
      { status: 500 }
    );
  }
}
