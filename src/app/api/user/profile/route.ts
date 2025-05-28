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
      ...hand,
      createdAt: hand.created_at,
      heroCards: hand.hero_cards,
      summary: hand.hand_summary,
      isQuiz: hand.is_quiz,
      quizQuestion: hand.quiz_question,
    }));
    const mappedUser = {
      ...user,
      createdAt: user.createdAt || user.created_at,
    };
    return NextResponse.json({
      user: mappedUser,
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