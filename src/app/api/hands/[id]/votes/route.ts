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
    // Check if user has already voted
    const existingVote = await prisma.upvote.findUnique({
      where: {
        userId_handId: {
          userId: session.user.id,
          handId: id,
        },
      },
    });
    let voted = false;
    if (existingVote) {
      // Remove vote if it exists
      await prisma.upvote.delete({
        where: {
          id: existingVote.id,
        },
      });
    } else {
      // Create new vote
      await prisma.upvote.create({
        data: {
          userId: session.user.id,
          handId: id,
        },
      });
      voted = true;
    }

    // Emit a Socket.IO event for the vote update
    io.emit("hand:update", { handId: id, hand: { ...hand, voted } });

    return NextResponse.json({ success: true, data: { voted } });
  } catch (error) {
    console.error("Error toggling vote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle vote" },
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
    const hasVoted = await prisma.upvote.findUnique({
      where: {
        userId_handId: {
          userId: session.user.id,
          handId: id,
        },
      },
    });
    const voteCount = await prisma.upvote.count({
      where: {
        handId: id,
      },
    });
    return NextResponse.json({
      success: true,
      data: {
        hasVoted: !!hasVoted,
        voteCount,
      },
    });
  } catch (error) {
    console.error("Error checking vote status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check vote status" },
      { status: 500 }
    );
  }
} 