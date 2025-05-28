import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

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

export async function GET(request: Request, contextPromise: any) {
  const { params } = await contextPromise;
  try {
    if (params.id === 'new') {
      return NextResponse.json({ success: true, data: null });
    }
    const hand = await prisma.hand.findUnique({
      where: { id: params.id },
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
    });

    if (!hand) {
      return NextResponse.json(
        { success: false, error: "Hand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: hand });
  } catch (error) {
    console.error("Error fetching hand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hand" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, contextPromise: any) {
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
      select: { userId: true },
    });

    if (!hand) {
      return NextResponse.json(
        { success: false, error: "Hand not found" },
        { status: 404 }
      );
    }

    if (hand.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = handSchema.parse(body);

    const updatedHand = await prisma.hand.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        tags: validatedData.tags,
      },
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

    return NextResponse.json({ success: true, data: updatedHand });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating hand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hand" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, contextPromise: any) {
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
      select: { userId: true },
    });

    if (!hand) {
      return NextResponse.json(
        { success: false, error: "Hand not found" },
        { status: 404 }
      );
    }

    if (hand.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.hand.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hand:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete hand" },
      { status: 500 }
    );
  }
} 