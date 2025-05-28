import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
        <AlertCircle className="h-5 w-5" />
        <p>{message}</p>
      </div>
    </div>
  );
} 