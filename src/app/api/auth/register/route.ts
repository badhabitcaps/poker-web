import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[REGISTER] Received registration request for:', body.email);
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      console.log('[REGISTER] Email already registered:', validatedData.email);
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user with verification token
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: tokenExpiry,
        emailVerified: null,
      },
    });
    console.log('[REGISTER] User created:', user.email);

    // Send verification email
    const emailResult = await resend.emails.send({
      from: "Poker Hand Tracker <noreply@handshare.app>",
      to: validatedData.email,
      subject: "Verify your email address",
      html: `
        <h1>Welcome to Poker Hand Tracker!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}">
          Verify Email Address
        </a>
        <p>This link will expire in 24 hours.</p>
      `,
    });
    console.log('[REGISTER] Verification email sent to:', validatedData.email, 'Result:', emailResult);

    // Remove sensitive data from response
    const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutSensitiveData,
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Check for password regex error and replace with custom message
      const passwordError = error.errors.find(e => e.path.includes('password') && e.code === 'invalid_string');
      if (passwordError && passwordError.message === 'Invalid') {
        return NextResponse.json(
          { success: false, error: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number." },
          { status: 400 }
        );
      }
      // Otherwise, return the first error message
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("[REGISTER] Error registering user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register user" },
      { status: 500 }
    );
  }
} 