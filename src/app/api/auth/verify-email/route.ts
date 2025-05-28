import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[VERIFY-EMAIL] Received verification request with token:', body.token);
    const { token } = verifyEmailSchema.parse(body);

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      console.log('[VERIFY-EMAIL] Invalid or expired token:', token);
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });
    console.log('[VERIFY-EMAIL] Email verified for user:', user.email);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("[VERIFY-EMAIL] Error verifying email:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
} 