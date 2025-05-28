"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { HandCard } from "@/components/hand-card";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
}

interface Hand {
  id: string;
  title: string;
  stakes: string;
  heroCards: string[];
  board: string[];
  summary: string;
  createdAt: string;
  _count: {
    votes: number;
    comments: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hands, setHands] = useState<Hand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data.user);
        setHands(data.hands);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{user.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Member since</h3>
              <p className="mt-1">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Hands</h2>
          <Button onClick={() => router.push("/hand/new")}>
            Create New Hand
          </Button>
        </div>

        {hands.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              You haven't created any hands yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hands.map((hand) => (
              <HandCard
                key={hand.id}
                {...hand}
                onClick={() => router.push(`/hand/${hand.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 