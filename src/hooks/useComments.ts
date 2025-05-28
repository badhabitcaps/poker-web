import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocketIO } from "./useSocket";
import { getSocket } from "@/lib/socket";

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

        // Emit new comment event via Socket.IO
        const socket = getSocket();
        socket.emit("comment:new", { handId, comment: data.data });

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

  // Listen for real-time new comments
  useSocketIO("comment:new", (data: { handId: string; comment: Comment }) => {
    if (data.handId !== handId) return;
    setComments((prev) => [data.comment, ...prev]);
  });

  return {
    comments,
    loading,
    error,
    addComment,
    refresh: fetchComments,
  };
} 