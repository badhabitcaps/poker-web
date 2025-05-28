"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PokerCards } from "@/components/ui/poker-cards";
import { useHand } from "@/hooks/useHand";
import { useComments } from "@/hooks/useComments";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentSection } from "@/components/CommentSection";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function HandDetail({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const {
    hand,
    loading: handLoading,
    error: handError,
    vote,
    save,
    hasVoted,
    isSaved,
    voteCount,
    refresh: refreshHand,
  } = useHand(params.id);
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    addComment,
    refresh: refreshComments,
  } = useComments(params.id);

  if (handLoading) {
    return <LoadingSpinner />;
  }

  if (handError) {
    return <ErrorMessage message={handError} />;
  }

  if (!hand) {
    return <ErrorMessage message="Hand not found" />;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <div className="flex items-center gap-3">
            {hand.user.image ? (
              <Image
                src={hand.user.image}
                alt={hand.user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <span className="text-lg font-semibold text-gray-600">
                  {hand.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold">{hand.user.name}</span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(hand.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <h1 className="mb-2 text-2xl font-bold">{hand.title}</h1>

          <div className="mb-3 flex flex-wrap gap-2">
            {hand.isQuiz && (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                Quiz
              </span>
            )}
            {hand.tags.map(({ tag }) => (
              <span
                key={tag.name}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="mb-6 flex items-center gap-3">
            <PokerCards cards={hand.heroCards} variant="hero" />
            {hand.board.length > 0 && (
              <>
                <div className="h-10 w-px bg-gray-200" />
                <PokerCards cards={hand.board} variant="board" />
              </>
            )}
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">
              {hand.isQuiz ? "Quiz Question" : "Hand Summary"}
            </h2>
            <p className="text-gray-600">
              {hand.isQuiz ? hand.quizQuestion : hand.summary}
            </p>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium text-gray-600">
              {hand.stakes}
            </span>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={vote}
                disabled={!session}
                className={hasVoted ? "text-red-500" : ""}
              >
                <Heart className="mr-1 h-4 w-4" />
                <span>{voteCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={save}
                disabled={!session}
                className={isSaved ? "text-blue-500" : ""}
              >
                <Bookmark className="mr-1 h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <MessageCircle className="mr-1 h-4 w-4" />
                <span>{hand._count.comments}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CommentSection
        comments={comments}
        loading={commentsLoading}
        error={commentsError}
        onAddComment={addComment}
        onRefresh={refreshComments}
      />
    </div>
  );
} 