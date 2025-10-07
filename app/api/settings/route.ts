
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get all settings or specific setting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (key) {
      const setting = await prisma.setting.findUnique({
        where: { key },
      });

      if (!setting) {
        return NextResponse.json(
          { error: "Setting not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(setting);
    }

    // Get all settings
    const settings = await prisma.setting.findMany();
    
    // Convert to object format
    const settingsObj: Record<string, any> = {};
    settings.forEach((s) => {
      try {
        settingsObj[s.key] = JSON.parse(s.value);
      } catch {
        settingsObj[s.key] = s.value;
      }
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST - Update or create setting
export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    const valueStr = typeof value === "string" ? value : JSON.stringify(value);

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: valueStr },
      create: { key, value: valueStr },
    });

    return NextResponse.json({
      success: true,
      setting,
      message: `Setting ${key} updated`,
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
