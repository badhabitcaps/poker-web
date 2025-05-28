import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const handSchema = z.object({
  title: z.string().min(1),
  stakes: z.string().min(1),
  hero_cards: z.array(z.string()).length(2),
  board: z.array(z.string()).max(5),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const validated = handSchema.parse(body);
    const hand = await prisma.hand.create({
      data: {
        title: validated.title,
        stakes: validated.stakes,
        hero_cards: validated.hero_cards,
        board: validated.board,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ success: true, data: { id: hand.id } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 