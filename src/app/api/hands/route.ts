import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Server } from "socket.io";
import { createServer } from "http";

const handSchema = z.object({
  title: z.string().min(1).max(200),
  stakes: z.string().min(1).max(50),
  heroCards: z.array(z.string()).length(2),
  board: z.array(z.string()).max(5),
  summary: z.string().optional(),
  isQuiz: z.boolean().optional(),
  quizQuestion: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Create a Socket.IO server instance
const httpServer = createServer();
const io = new Server(httpServer);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const tag = searchParams.get("tag");
    const userId = searchParams.get("userId");
    const isQuiz = searchParams.get("isQuiz");

    const where = {
      ...(tag && {
        tags: {
          has: tag,
        },
      }),
      ...(userId && { userId }),
      ...(isQuiz && { isQuiz: isQuiz === "true" }),
    };

    const [hands, total] = await Promise.all([
      prisma.hand.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              comments: true,
              Upvote: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.hand.count({ where }),
    ]);

    // Emit a Socket.IO event for the hands update
    io.emit("hands:update", { hands });

    return NextResponse.json({
      success: true,
      data: {
        hands: hands.map((hand: any) => ({
          ...hand,
          createdAt: hand.created_at,
          heroCards: hand.hero_cards,
          summary: hand.hand_summary,
          isQuiz: hand.is_quiz,
          quizQuestion: hand.quiz_question,
        })),
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching hands:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hands" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = handSchema.parse(body);

    // Map camelCase fields to snake_case for Prisma
    const prismaData = {
      title: validatedData.title,
      stakes: validatedData.stakes,
      tags: validatedData.tags,
      hero_cards: validatedData.heroCards,
      board: validatedData.board,
      is_quiz: validatedData.isQuiz,
      quiz_question: validatedData.quizQuestion,
      hand_summary: validatedData.summary,
      userId: session.user.id,
    };

    const hand = await prisma.hand.create({
      data: prismaData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: hand });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating hand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create hand" },
      { status: 500 }
    );
  }
} 