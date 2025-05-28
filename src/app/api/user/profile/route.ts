import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const hands = await prisma.hand.findMany({
      where: { userId: user.id },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        stakes: true,
        hero_cards: true,
        board: true,
        hand_summary: true,
        created_at: true,
        _count: {
          select: {
            Upvote: true,
            comments: true,
          },
        },
      },
    });

    // Map DB fields to camelCase for frontend
    const mappedHands = hands.map((hand: any) => ({
      id: hand.id,
      title: hand.title,
      stakes: hand.stakes,
      tags: [],
      hero_cards: hand.hero_cards,
      board: hand.board,
      createdAt: hand.created_at,
      is_quiz: false,
      comment_count: hand._count.comments,
      upvote_count: hand._count.Upvote,
      username: user.name || "",
      avatar_url: user.image || null,
      user_id: user.id,
      quiz_question: undefined,
      hand_summary: hand.hand_summary,
      is_draft: false,
      is_own_post: true,
    }));

    return NextResponse.json({
      user,
      hands: mappedHands,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
} 