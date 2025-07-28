// import DuplicateDetection from '@/components/duplicate-detection2';

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gray-50">
//       <DuplicateDetection />
//     </main>
//   );
// }


"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import DetectDuplicateButton from '@/components/duplicate-detection-button';
import ResultsModal from '@/components/duplicate-result-modal';
import { DuplicateDetectionResponse } from '@/types/duplicate-detection';

export default function Page() {
  const [issueId, setIssueId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [result, setResult] = useState<DuplicateDetectionResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const handleResult = (newResult: DuplicateDetectionResponse) => {
    setResult(newResult);
    setShowModal(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearForm = () => {
    setIssueId('');
    setIssueDescription('');
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
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
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <DetectDuplicateButton
              issueId={issueId}
              issueDescription={issueDescription}
              onResult={handleResult}
              onError={handleError}
            />

            <Button variant="outline" onClick={clearForm}>
              Clear Form
            </Button>
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

      {/* Results Modal */}
      <ResultsModal
        isOpen={showModal}
        onClose={closeModal}
        result={result}
      />
    </div>
  );
}
