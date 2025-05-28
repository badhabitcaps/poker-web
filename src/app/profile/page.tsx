"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { HandCard, HandCardProps } from "@/components/hand-card";
import { useSocketIO } from "@/hooks/useSocket";

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
  const [hands, setHands] = useState<HandCardProps[]>([]);
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
        setHands(
          data.hands.map((hand: any) => ({
            id: hand.id,
            title: hand.title,
            stakes: hand.stakes,
            tags: hand.tags?.map((t: any) => t.tag?.name) || [],
            hero_cards: hand.hero_cards || hand.heroCards || [],
            board: hand.board || [],
            createdAt: hand.createdAt || hand.created_at,
            is_quiz: hand.is_quiz || hand.isQuiz || false,
            comment_count: hand._count?.comments ?? 0,
            upvote_count: hand._count?.Upvote ?? hand._count?.votes ?? 0,
            username: data.user.name || "You",
            avatar_url: data.user.image || null,
            user_id: data.user.id,
            quiz_question: hand.quiz_question || hand.quizQuestion || "",
            hand_summary: hand.hand_summary || hand.summary || "",
            is_draft: hand.is_draft || false,
            is_own_post: true,
          }))
        );
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

  // Real-time updates for hands
  useSocketIO("hands:update", (data: { hands: any[] }) => {
    if (!session?.user?.id) return;
    setHands(
      data.hands
        .filter((hand: any) => hand.userId === session.user.id)
        .map((hand: any) => ({
          id: hand.id,
          title: hand.title,
          stakes: hand.stakes,
          tags: hand.tags?.map((t: any) => t.tag?.name) || [],
          hero_cards: hand.hero_cards || hand.heroCards || [],
          board: hand.board || [],
          createdAt: hand.createdAt || hand.created_at,
          is_quiz: hand.is_quiz || hand.isQuiz || false,
          comment_count: hand._count?.comments ?? 0,
          upvote_count: hand._count?.Upvote ?? hand._count?.votes ?? 0,
          username: session.user.name || "You",
          avatar_url: session.user.image || null,
          user_id: session.user.id,
          quiz_question: hand.quiz_question || hand.quizQuestion || "",
          hand_summary: hand.hand_summary || hand.summary || "",
          is_draft: hand.is_draft || false,
          is_own_post: true,
        }))
    );
  });

  useSocketIO("hand:new", (data: { hand: any }) => {
    if (!session?.user?.id) return;
    if (data.hand.userId !== session.user.id) return;
    setHands((prev) => [
      {
        id: data.hand.id,
        title: data.hand.title,
        stakes: data.hand.stakes,
        tags: data.hand.tags?.map((t: any) => t.tag?.name) || [],
        hero_cards: data.hand.hero_cards || data.hand.heroCards || [],
        board: data.hand.board || [],
        createdAt: data.hand.createdAt || data.hand.created_at,
        is_quiz: data.hand.is_quiz || data.hand.isQuiz || false,
        comment_count: data.hand._count?.comments ?? 0,
        upvote_count: data.hand._count?.Upvote ?? data.hand._count?.votes ?? 0,
        username: session.user.name || "You",
        avatar_url: session.user.image || null,
        user_id: session.user.id,
        quiz_question: data.hand.quiz_question || data.hand.quizQuestion || "",
        hand_summary: data.hand.hand_summary || data.hand.summary || "",
        is_draft: data.hand.is_draft || false,
        is_own_post: true,
      },
      ...prev,
    ]);
  });

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