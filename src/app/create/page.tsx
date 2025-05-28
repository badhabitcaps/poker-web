"use client";
import { useState } from "react";

export default function CreateHand() {
  const [title, setTitle] = useState("");
  const [stakes, setStakes] = useState("");
  const [heroCards, setHeroCards] = useState(["", ""]);
  const [board, setBoard] = useState(["", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/create-hand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, stakes, hero_cards: heroCards, board }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Hand created! ID: " + data.data.id);
      } else {
        setMessage("Error: " + (typeof data.error === "string" ? data.error : JSON.stringify(data.error)));
      }
    } catch (err) {
      setMessage("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "2rem auto", display: "flex", flexDirection: "column", gap: 12 }}>
      <h1>Create Hand (Minimal)</h1>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <input placeholder="Stakes" value={stakes} onChange={e => setStakes(e.target.value)} required />
      <div>
        <label>Hero Cards (2):</label>
        <input value={heroCards[0]} onChange={e => setHeroCards([e.target.value, heroCards[1]])} placeholder="e.g. As" required maxLength={2} />
        <input value={heroCards[1]} onChange={e => setHeroCards([heroCards[0], e.target.value])} placeholder="e.g. Ks" required maxLength={2} />
      </div>
      <div>
        <label>Board (up to 5):</label>
        {board.map((card, i) => (
          <input key={i} value={card} onChange={e => setBoard(board.map((c, j) => j === i ? e.target.value : c))} placeholder={`Card ${i+1}`} maxLength={2} />
        ))}
      </div>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Posting..." : "Create Hand"}</button>
      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </form>
  );
} 