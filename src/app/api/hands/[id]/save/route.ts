import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Server } from "socket.io";
import { createServer } from "http";

// Create a Socket.IO server instance
const httpServer = createServer();
const io = new Server(httpServer);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  try {
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    const hand = await prisma.hand.findUnique({
      where: { id },
    });
    if (!hand) {
      return NextResponse.json(
        { success: false, error: "Hand not found" },
        { status: 404 }
      );
    }
    // Check if user has already saved
    // const existingSave = await prisma.savedHand.findUnique({
    //   where: {
    //     userId_handId: {
    //       userId: session.user.id,
    //       handId: id,
    //     },
    //   },
    // });
    // let saved = false;
    // if (existingSave) {
    //   // Remove save if it exists
    //   await prisma.savedHand.delete({
    //     where: {
    //       id: existingSave.id,
    //     },
    //   });
    // } else {
    //   // Create new save
    //   await prisma.savedHand.create({
    //     data: {
    //       userId: session.user.id,
    //       handId: id,
    //     },
    //   });
    //   saved = true;
    // }
    // TODO: Implement saved hand logic if/when a SavedHand model is added to the schema.
    let saved = false;

    // Emit a Socket.IO event for the save update
    io.emit("hand:update", { handId: id, hand: { ...hand, saved } });

    return NextResponse.json({ success: true, data: { saved } });
  } catch (error) {
    console.error("Error toggling save:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle save" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    // const isSaved = await prisma.savedHand.findUnique({
    //   where: {
    //     userId_handId: {
    //       userId: session.user.id,
    //       handId: id,
    //     },
    //   },
    // });
    // return NextResponse.json({
    //   success: true,
    //   data: {
    //     isSaved: !!isSaved,
    //   },
    // });
    // TODO: Implement saved hand logic if/when a SavedHand model is added to the schema.
    return NextResponse.json({
      success: true,
      data: {
        isSaved: false,
      },
    });
  } catch (error) {
    console.error("Error checking save status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check save status" },
      { status: 500 }
    );
  }
} 