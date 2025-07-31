"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb } from "lucide-react";
import { RCAGenerationResponse, SimilarIssue } from "@/types/duplicate-detection";

interface GenerateRCAButtonProps {
  currentIssueDescription: string; // Add this prop
  similarIssues: SimilarIssue[];
  onResult: (rcaCategory: string, rcaDetail: string, explanation: string) => void; // Updated to match backend response
  onError: (msg: string) => void;
}

export default function GenerateRCAButton({
  currentIssueDescription, // Add this prop
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

    if (!currentIssueDescription) {
      onError("Current issue description is required.");
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
        body: JSON.stringify({
          current_issue_description: currentIssueDescription, // Add this field
          similar_issues: similarIssues
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate RCA.");
      }

      const data : RCAGenerationResponse = await response.json();
      onResult(data);
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
      disabled={loading || similarIssues.length === 0 || !currentIssueDescription}
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
