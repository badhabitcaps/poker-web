"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PokerCards } from "./ui/poker-cards";
import { useRouter } from "next/navigation";

export interface HandCardProps {
  id: string;
  title: string;
  stakes: string;
  tags: string[];
  hero_cards: string[];
  board: string[];
  createdAt: string;
  is_quiz: boolean;
  comment_count: number;
  upvote_count: number;
  username: string;
  avatar_url: string | null;
  user_id: string;
  quiz_question?: string;
  hand_summary?: string;
  is_draft?: boolean;
  is_own_post?: boolean;
  onClick?: () => void;
}

export function HandCard({
  id,
  title,
  stakes,
  tags,
  hero_cards,
  board,
  createdAt,
  is_quiz,
  comment_count,
  upvote_count,
  username,
  avatar_url,
  user_id,
  quiz_question,
  hand_summary,
  is_draft = false,
  is_own_post = false,
  onClick,
}: HandCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        <div className="text-sm text-gray-500">
          {createdAt && !isNaN(new Date(createdAt).getTime())
            ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
            : "Unknown time"}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Stakes</div>
            <div>{stakes}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Hero Cards</div>
            <div className="flex gap-2">
              {hero_cards.map((card, index) => (
                <div
                  key={index}
                  className="rounded bg-gray-100 px-2 py-1 text-sm"
                >
                  {card}
                </div>
              ))}
            </div>
          </div>
          {board.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-500">Board</div>
              <div className="flex gap-2">
                {board.map((card, index) => (
                  <div
                    key={index}
                    className="rounded bg-gray-100 px-2 py-1 text-sm"
                  >
                    {card}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-500">Summary</div>
            <p className="line-clamp-2 text-sm">{is_quiz ? quiz_question : hand_summary}</p>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            <div>{comment_count} comments</div>
            <div>{upvote_count} upvotes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 