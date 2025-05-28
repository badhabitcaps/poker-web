import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "./useSocket";

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

interface UseCommentsResult {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addComment: (content: string, parentId?: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useComments(handId: string): UseCommentsResult {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribe, send } = useSocket();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/hands/${handId}/comments`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch comments");
      }

      setComments(data.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [handId]);

  const addComment = useCallback(
    async (content: string, parentId?: string) => {
      if (!session?.user) return;

      try {
        const response = await fetch(`/api/hands/${handId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            parentId,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to add comment");
        }

        if (parentId) {
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...comment.replies, data.data],
                };
              }
              return comment;
            })
          );
        } else {
          setComments((prev) => [data.data, ...prev]);
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
      }
    },
    [handId, session]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const unsubscribe = subscribe(`comments:${handId}`, (data) => {
      if (data.type === "new") {
        if (data.parentId) {
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === data.parentId) {
                return {
                  ...comment,
                  replies: [...comment.replies, data.comment],
                };
              }
              return comment;
            })
          );
        } else {
          setComments((prev) => [data.comment, ...prev]);
        }
      } else if (data.type === "update") {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === data.comment.id) {
              return { ...comment, ...data.comment };
            }
            if (comment.replies.some((reply) => reply.id === data.comment.id)) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === data.comment.id ? { ...reply, ...data.comment } : reply
                ),
              };
            }
            return comment;
          })
        );
      } else if (data.type === "delete") {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === data.commentId) {
              return null;
            }
            if (comment.replies.some((reply) => reply.id === data.commentId)) {
              return {
                ...comment,
                replies: comment.replies.filter((reply) => reply.id !== data.commentId),
              };
            }
            return comment;
          }).filter(Boolean) as Comment[]
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [handId, subscribe]);

  return {
    comments,
    loading,
    error,
    addComment,
    refresh: fetchComments,
  };
} 