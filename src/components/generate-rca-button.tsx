"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb } from "lucide-react";
import { SimilarIssue } from "@/types/duplicate-detection";

interface GenerateRCAButtonProps {
  similarIssues: SimilarIssue[];
  onResult: (rcaText: string) => void;
  onError: (msg: string) => void;
}

export default function GenerateRCAButton({
  similarIssues,
  onResult,
  onError,
}: GenerateRCAButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerateRCA = async () => {
    if (!similarIssues || similarIssues.length === 0) {
      onError("No similar issues available for RCA generation.");
      return;
    }

    setLoading(true);
    onError("");

    try {
      const response = await fetch("http://localhost:8000/generate-rca", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ similar_issues: similarIssues }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate RCA.");
      }

      const data = await response.json();
      onResult(data.rca_text || "No RCA generated.");
    } catch (error) {
      console.error("RCA Generation Error:", error);
      onError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateRCA}
      disabled={loading || similarIssues.length === 0}
      className="w-full flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating RCA...
        </>
      ) : (
        <>
          <Lightbulb className="h-4 w-4" />
          Generate Potential RCA
        </>
      )}
    </Button>
  );
}
