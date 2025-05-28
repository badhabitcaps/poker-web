import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request, contextPromise: any) {
  const { params } = await contextPromise;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const hand = await prisma.hand.findUnique({
      where: { id: params.id },
    });

    if (!hand) {
      return NextResponse.json(
        { success: false, error: "Hand not found" },
        { status: 404 }
      );
    }

    // TODO: Implement save/unsave functionality. No SavedHand model in schema.
    return NextResponse.json({ success: false, error: "Save functionality not implemented." }, { status: 501 });
  } catch (error) {
    console.error("Error toggling save:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle save" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, contextPromise: any) {
  const { params } = await contextPromise;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Implement get save status functionality. No SavedHand model in schema.
    return NextResponse.json({ success: false, error: "Save functionality not implemented." }, { status: 501 });
  } catch (error) {
    console.error("Error fetching save status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch save status" },
      { status: 500 }
    );
  }
} 