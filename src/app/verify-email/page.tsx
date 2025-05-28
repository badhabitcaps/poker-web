"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setError("Invalid verification link");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify email");
        }

        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to verify email");
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner className="mb-4" />
            <p className="text-center text-gray-600">Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {status === "success" ? "Email Verified!" : "Verification Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "success"
              ? "Your email has been verified successfully."
              : "We couldn't verify your email address."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "error" && error && (
            <ErrorMessage message={error} className="mb-4" />
          )}
          <Button
            className="w-full"
            onClick={() => router.push(status === "success" ? "/login" : "/register")}
          >
            {status === "success" ? "Sign in" : "Try again"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 