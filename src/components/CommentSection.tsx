import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  replies: Comment[];
}

interface CommentSectionProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function CommentSection({
  comments,
  loading,
  error,
  onAddComment,
  onRefresh,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(replyContent, parentId);
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = (comment: Comment) => (
    <Card key={comment.id} className="mb-4">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-3">
          {comment.user.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <span className="text-sm font-semibold text-gray-600">
                {comment.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold">{comment.user.name}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <p className="text-gray-600">{comment.content}</p>
        {session && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          >
            Reply
          </Button>
        )}
        {replyingTo === comment.id && (
          <form
            onSubmit={(e) => handleSubmitReply(e, comment.id)}
            className="mt-4 space-y-2"
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
              placeholder="Write a reply..."
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !replyContent.trim()}
              >
                {isSubmitting ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </form>
        )}
        {comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-gray-100 pl-4">
            {comment.replies.map((reply) => renderComment(reply))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Comments</h2>

      {session && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
            placeholder="Add a comment..."
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => renderComment(comment))}
      </div>
    </div>
  );
} 