import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent",
        className
      )}
    />
  );
} 