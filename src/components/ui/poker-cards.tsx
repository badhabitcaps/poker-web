import { cn } from "@/lib/utils";

interface PokerCardsProps {
  cards: string[];
  label?: string;
  variant?: "hero" | "board";
  className?: string;
}

export function PokerCards({ cards, label, variant = "hero", className }: PokerCardsProps) {
  const safeCards = cards ?? [];

  const getCardColor = (card: string) => {
    if (!card) return "text-gray-400";
    const suit = card.slice(-1).toLowerCase();
    return suit === "s" || suit === "c" ? "text-black" : "text-red-600";
  };

  const formatCard = (card: string) => {
    if (!card) return "";
    const value = card.slice(0, -1).toUpperCase();
    const suit = card.slice(-1).toLowerCase();
    const suitSymbol = {
      s: "♠",
      h: "♥",
      d: "♦",
      c: "♣",
    }[suit] || "";
    return `${value}${suitSymbol}`;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span className="text-sm font-semibold text-gray-600">{label}</span>
      )}
      <div className="flex gap-2">
        {safeCards.map((card, index) => (
          <div
            key={index}
            className={cn(
              "flex h-14 w-10 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm",
              variant === "board" && "h-12 w-9",
              !card && "bg-gray-50"
            )}
          >
            <span className={cn("text-lg font-semibold", getCardColor(card))}>
              {formatCard(card)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 