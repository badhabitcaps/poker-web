"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PokerCards } from "@/components/ui/poker-cards";
import { useHand } from "@/hooks/useHand";
import { useComments } from "@/hooks/useComments";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, MessageCircle, Share2, Clock, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentSection } from "@/components/CommentSection";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";

export default function HandDetail() {
  const params = useParams();
  const id = params.id as string;
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
  } = useHand(id);
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    addComment,
    refresh: refreshComments,
  } = useComments(id);

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
        <CardHeader className="flex flex-row items-center justify-between gap-4 p-4">
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{hand.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <DollarSign className="h-4 w-4" />
              <span>{hand.stakes}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{formatDistanceToNow(new Date(hand.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {hand.isQuiz && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Quiz
              </Badge>
            )}
            {hand.tags.map(({ tag }) => (
              <Badge key={tag.name} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Hero's Cards</h3>
              <PokerCards cards={hand.heroCards} variant="hero" />
            </div>
            {hand.board.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Board</h3>
                <PokerCards cards={hand.board} variant="board" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {hand.isQuiz ? "Quiz Question" : "Hand Summary"}
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {hand.isQuiz ? hand.quizQuestion : hand.summary}
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={vote}
                disabled={!session}
                className={`flex items-center gap-1 ${hasVoted ? "text-red-500" : ""}`}
              >
                <Heart className="h-4 w-4" />
                <span>{voteCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={save}
                disabled={!session}
                className={`flex items-center gap-1 ${isSaved ? "text-blue-500" : ""}`}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
                <MessageCircle className="h-4 w-4" />
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