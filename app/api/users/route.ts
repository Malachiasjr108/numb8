
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - List all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Create or update user
export async function POST(request: NextRequest) {
  try {
    const { email, name, role } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role },
      create: { email, name, role: role || "user" },
    });

    return NextResponse.json({
      success: true,
      user,
      message: "User saved successfully",
    });
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json(
      { error: "Failed to save user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { email },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
