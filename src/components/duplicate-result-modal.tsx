"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { DuplicateDetectionResponse, RCAGenerationResponse } from "@/types/duplicate-detection";
import GenerateRCAButton from "./generate-rca-button";

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DuplicateDetectionResponse | null;
}



export default function ResultsModal({ isOpen, onClose, result }: ResultsModalProps) {
  const [rcaSuggestion, setRcaSuggestion] = useState<RCAGenerationResponse | null>(null);
  const [rcaError, setRcaError] = useState<string | null>(null);

  if (!result) return null;

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return "High Similarity";
    if (score >= 0.6) return "Medium Similarity";
    return "Low Similarity";
  };

  const topSimilarIssues = result.similar_issues.slice(0, 3);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
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
            </DialogTitle>
          </div>
          <DialogDescription>
            Analysis results for issue: {result.new_issue_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className={result.is_duplicate ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
            <AlertDescription className={result.is_duplicate ? "text-red-800" : "text-green-800"}>
              {result.is_duplicate
                ? `This issue appears to be a duplicate. One or more similar issues exceed the ${(result.duplicate_threshold * 100)}% similarity threshold.`
                : `This issue appears to be unique. No similar issues exceed the ${(result.duplicate_threshold * 100)}% similarity threshold.`}
            </AlertDescription>
          </Alert>

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

          {topSimilarIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 3 Most Similar Issues</CardTitle>
                <CardDescription>
                  Most similar issues found in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSimilarIssues.map((issue, index) => (
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
                      {/* <p className="text-gray-700 text-sm leading-relaxed">
                        <strong>RCA Category:</strong> {issue.rca_category || 'No RCA category provided.'}
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        <strong>RCA Details:</strong> {issue.rca_details || 'No additional details provided.'}
                      </p> */}
                    </div>
                  ))}
                </div>

              </CardContent>
            </Card>
            )}

           {/* RCA Section */}
           <Card className="border border-slate-200 shadow-md bg-white overflow-hidden">
             <CardHeader className="border-b border-purple-200 pb-4 m-0">
               <div className="flex justify-between items-center">
                 <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                   <Zap className="h-4 w-4 text-purple-600" />
                   Root Cause Analysis
                 </CardTitle>
                 <div className="flex justify-center items-center">
                   <GenerateRCAButton
                     currentIssueDescription={result.new_issue_description}
                     similarIssues={topSimilarIssues}
                     onResult={(data) => {
                      setRcaSuggestion(data);
                      setRcaError(null);
                    }}
                    onError={(msg) => {
                      setRcaSuggestion(null);
                      setRcaError(msg);
                    }}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="">
              {rcaError && (
                <Alert className="border-red-200 bg-red-50 shadow shadow-red-100 mb-4">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium text-sm">{rcaError}</AlertDescription>
                </Alert>
              )}

              {rcaSuggestion ? (
                <div className="space-y-6">
                  {rcaSuggestion.rca_category && (
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2 text-sm">Potential RCA Category</h4>
                      <p className="text-slate-800 text-sm">{rcaSuggestion.rca_category}</p>
                    </div>
                  )}
                  {rcaSuggestion.rca_detail && (
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2 text-sm">Potential RCA Details</h4>
                      <p className="text-slate-800 text-sm">{rcaSuggestion.rca_detail}</p>
                    </div>
                  )}
                  {rcaSuggestion.explanation && (
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2 text-sm">Explanation</h4>
                      <p className="text-slate-800 text-sm">{rcaSuggestion.explanation}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-slate-600 text-xs">Click "Generate Potential RCA" to analyze potential root causes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}


