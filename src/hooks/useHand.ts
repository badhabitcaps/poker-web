import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "./useSocket";

interface Hand {
  id: string;
  title: string;
  stakes: string;
  heroCards: string[];
  board: string[];
  summary?: string;
  isQuiz: boolean;
  quizQuestion?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  tags: {
    tag: {
      name: string;
    };
  }[];
  _count: {
    comments: number;
    votes: number;
  };
}

interface UseHandResult {
  hand: Hand | null;
  loading: boolean;
  error: string | null;
  vote: () => Promise<void>;
  save: () => Promise<void>;
  hasVoted: boolean;
  isSaved: boolean;
  voteCount: number;
  refresh: () => Promise<void>;
}

export function useHand(id: string): UseHandResult {
  const { data: session } = useSession();
  const [hand, setHand] = useState<Hand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const { subscribe, send } = useSocket();

  const fetchHand = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/hands/${id}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch hand");
      }

      setHand(data.data);
    } catch (error) {
      console.error("Error fetching hand:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch hand");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchVoteStatus = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/hands/${id}/votes`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch vote status");
      }

      setHasVoted(data.data.hasVoted);
      setVoteCount(data.data.voteCount);
    } catch (error) {
      console.error("Error fetching vote status:", error);
    }
  }, [id, session]);

  const fetchSaveStatus = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/hands/${id}/save`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch save status");
      }

      setIsSaved(data.data.isSaved);
    } catch (error) {
      console.error("Error fetching save status:", error);
    }
  }, [id, session]);

  const vote = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/hands/${id}/votes`, {
        method: "POST",
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to toggle vote");
      }

      setHasVoted(data.data.voted);
      setVoteCount((prev) => (data.data.voted ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error toggling vote:", error);
    }
  }, [id, session]);

  const save = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/hands/${id}/save`, {
        method: "POST",
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to toggle save");
      }

      setIsSaved(data.data.saved);
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  }, [id, session]);

  useEffect(() => {
    fetchHand();
    fetchVoteStatus();
    fetchSaveStatus();
  }, [fetchHand, fetchVoteStatus, fetchSaveStatus]);

  useEffect(() => {
    const unsubscribe = subscribe(`hand:${id}`, (data) => {
      setHand((prev) => {
        if (!prev) return data;
        return { ...prev, ...data };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [id, subscribe]);

  return {
    hand,
    loading,
    error,
    vote,
    save,
    hasVoted,
    isSaved,
    voteCount,
    refresh: fetchHand,
  };
} 