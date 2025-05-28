'use client';

import { HandCard } from "@/components/hand-card";

// This would typically come from your database
const MOCK_HANDS = [
  {
    id: "1",
    title: "Tough River Decision in 3-Bet Pot",
    stakes: "NL100",
    tags: ["River Decision", "3-Bet Pot", "Heads Up"],
    hero_cards: ["As", "Ks"],
    board: ["Qd", "Jd", "2c", "7h", "3d"],
    created_at: "2024-03-15T10:00:00Z",
    is_quiz: true,
    comment_count: 12,
    upvote_count: 5,
    username: "pokerpro",
    avatar_url: null,
    user_id: "1",
    quiz_question: "What should Hero do on the river facing this bet?",
  },
  {
    id: "2",
    title: "Interesting Bluff Catch Spot",
    stakes: "NL50",
    tags: ["Bluff Catch", "Live", "Cash Game"],
    hero_cards: ["Ah", "Kh"],
    board: ["Qd", "Jd", "2c", "7h", "3d"],
    created_at: "2024-03-14T15:30:00Z",
    is_quiz: false,
    comment_count: 8,
    upvote_count: 3,
    username: "cardplayer",
    avatar_url: null,
    user_id: "2",
    hand_summary: "Hero faces a tough decision on the river with top pair top kicker...",
  },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Poker Hands</h1>
        <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Create Hand
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_HANDS.map((hand) => (
          <HandCard key={hand.id} {...hand} />
        ))}
      </div>
    </div>
  );
}
