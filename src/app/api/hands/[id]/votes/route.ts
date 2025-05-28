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

    // Check if user has already voted
    const existingVote = await prisma.upvote.findUnique({
      where: {
        userId_handId: {
          userId: session.user.id,
          handId: params.id,
        },
      },
    });

    if (existingVote) {
      // Remove vote if it exists
      await prisma.upvote.delete({
        where: {
          id: existingVote.id,
        },
      });

      return NextResponse.json({ success: true, data: { voted: false } });
    }

    // Create new vote
    await prisma.upvote.create({
      data: {
        userId: session.user.id,
        handId: params.id,
      },
    });

    return NextResponse.json({ success: true, data: { voted: true } });
  } catch (error) {
    console.error("Error toggling vote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle vote" },
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

    const vote = await prisma.upvote.findUnique({
      where: {
        userId_handId: {
          userId: session.user.id,
          handId: params.id,
        },
      },
    });

    const voteCount = await prisma.upvote.count({
      where: {
        handId: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        hasVoted: !!vote,
        voteCount,
      },
    });
  } catch (error) {
    console.error("Error fetching vote status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vote status" },
      { status: 500 }
    );
  }
} 