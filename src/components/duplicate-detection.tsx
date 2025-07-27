"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface SimilarIssue {
  ticket_id: string;
  description: string;
  similarity_score: number;
}

interface DuplicateDetectionResponse {
  new_issue_id: string;
  new_issue_description: string;
  similar_issues: SimilarIssue[];
  is_duplicate: boolean;
  duplicate_threshold: number;
}

export default function DuplicateDetection() {
  const [issueId, setIssueId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DuplicateDetectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetectDuplicates = async () => {
    if (!issueId.trim() || !issueDescription.trim()) {
      setError('Please provide both Issue ID and Description');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

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
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return 'High Similarity';
    if (score >= 0.6) return 'Medium Similarity';
    return 'Low Similarity';
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setIssueId('');
    setIssueDescription('');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Duplicate Issue Detection
        </h1>
        <p className="text-gray-600">
          Enter a new issue to check for potential duplicates in the system
        </p>
      </div>

      {/* Input Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New Issue Details</CardTitle>
          <CardDescription>
            Provide the issue ID and description to check for duplicates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="issueId" className="block text-sm font-medium text-gray-700 mb-1">
              Issue ID
            </label>
            <Input
              id="issueId"
              placeholder="e.g., ISSUE-001"
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Issue Description
            </label>
            <Textarea
              id="issueDescription"
              placeholder="Describe the issue in detail..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDetectDuplicates}
              disabled={loading || !issueId.trim() || !issueDescription.trim()}
              className="flex items-center gap-2"
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

            {(result || error) && (
              <Button variant="outline" onClick={clearResults}>
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Duplicate Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.is_duplicate ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Potential Duplicate Detected
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    No Duplicates Found
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={result.is_duplicate ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                <AlertDescription className={result.is_duplicate ? "text-red-800" : "text-green-800"}>
                  {result.is_duplicate
                    ? `This issue appears to be a duplicate. One or more similar issues exceed the ${(result.duplicate_threshold * 100)}% similarity threshold.`
                    : `This issue appears to be unique. No similar issues exceed the ${(result.duplicate_threshold * 100)}% similarity threshold.`
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Issue Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Issue ID:</span>
                  <span className="ml-2 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {result.new_issue_id}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                    {result.new_issue_description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Issues */}
          {result.similar_issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Most Similar Issues</CardTitle>
                <CardDescription>
                  Top {result.similar_issues.length} most similar issues found in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.similar_issues.map((issue, index) => (
                    <div key={issue.ticket_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            #{index + 1} - {issue.ticket_id}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getSimilarityColor(issue.similarity_score)}>
                            {getSimilarityLabel(issue.similarity_score)}
                          </Badge>
                          <span className="text-sm font-mono text-gray-600">
                            {(issue.similarity_score * 100).toFixed(1)}% similar
                          </span>
                        </div>
                      </div>

                      <Separator className="mb-3" />

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {issue.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
