import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { DuplicateDetectionResponse } from '@/types/duplicate-detection';

interface DetectDuplicateButtonProps {
  issueId: string;
  issueDescription: string;
  onResult: (result: DuplicateDetectionResponse) => void;
  onError: (error: string) => void;
}

export default function DetectDuplicateButton({
  issueId,
  issueDescription,
  onResult,
  onError
}: DetectDuplicateButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDetectDuplicates = async () => {
    if (!issueId.trim() || !issueDescription.trim()) {
      onError('Please provide both Issue ID and Description');
      return;
    }

    setLoading(true);
    onError(''); // Clear previous errors

    try {
      const response = await fetch('http://localhost:8000/detect-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: issueId.trim(),
          description: issueDescription.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to detect duplicates');
      }

      const data: DuplicateDetectionResponse = await response.json();
      onResult(data);
      console.log('Duplicate detection result:', data);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDetectDuplicates}
      disabled={loading || !issueId.trim() || !issueDescription.trim()}
      className="w-full flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Search className="h-4 w-4" />
          Detect Duplicates
        </>
      )}
    </Button>
  );
}
