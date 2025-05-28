'use client';

import { HandCard } from "@/components/hand-card";
import { useEffect, useState } from "react";

export default function Home() {
  const [hands, setHands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHands = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hands");
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to fetch hands");
        // Map API hands to HandCard props
        setHands(
          data.data.hands.map((hand: any) => ({
            id: hand.id,
            title: hand.title,
            stakes: hand.stakes,
            tags: hand.tags?.map((t: any) => t.tag?.name) || [],
            hero_cards: hand.hero_cards,
            board: hand.board,
            createdAt: hand.createdAt || hand.created_at,
            is_quiz: hand.is_quiz,
            comment_count: hand._count?.comments ?? 0,
            upvote_count: hand._count?.votes ?? 0,
            username: hand.user?.name || "Unknown",
            avatar_url: hand.user?.image || null,
            user_id: hand.user?.id || "",
            quiz_question: hand.quiz_question,
            hand_summary: hand.hand_summary,
            is_draft: hand.is_draft,
            is_own_post: false,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hands");
      } finally {
        setLoading(false);
      }
    };
    fetchHands();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Poker Hands</h1>
        <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Create Hand
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {hands.length === 0 ? (
            <div className="text-gray-500">No hands found.</div>
          ) : (
            hands.map((hand) => <HandCard key={hand.id} {...hand} />)
          )}
        </div>
      )}
    </div>
  );
}
