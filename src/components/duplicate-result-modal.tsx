// "use client";

// import React, { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Alert,
//   AlertDescription,
// } from "@/components/ui/alert";
// import { Separator } from "@/components/ui/separator";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   AlertTriangle,
//   CheckCircle,
//   Copy,
//   FileText,
//   Zap,
//   TrendingUp,
// } from "lucide-react";
// import { DuplicateDetectionResponse, RCAGenerationResponse } from "@/types/duplicate-detection";
// import GenerateRCAButton from "./generate-rca-button";

// interface ResultsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   result: DuplicateDetectionResponse | null;
// }

// export default function ResultsModal({ isOpen, onClose, result }: ResultsModalProps) {
//   const [rcaSuggestion, setRcaSuggestion] = useState<RCAGenerationResponse | null>(null);
//   const [rcaError, setRcaError] = useState<string | null>(null);

//   if (!result) return null;

//   const getSimilarityColor = (score: number) => {
//     if (score >= 0.8) return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200 shadow-red-100";
//     if (score >= 0.6) return "bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800 border-amber-200 shadow-amber-100";
//     return "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 border-emerald-200 shadow-emerald-100";
//   };

//   const getSimilarityLabel = (score: number) => {
//     if (score >= 0.8) return "High Similarity";
//     if (score >= 0.6) return "Medium Similarity";
//     return "Low Similarity";
//   };

//   const getSimilarityIcon = (score: number) => {
//     if (score >= 0.8) return <AlertTriangle className="h-3 w-3" />;
//     if (score >= 0.6) return <TrendingUp className="h-3 w-3" />;
//     return <CheckCircle className="h-3 w-3" />;
//   };

//   const topSimilarIssues = result.similar_issues.slice(0, 3);

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden bg-white">
//         <DialogHeader className="pb-6 border-b border-slate-200/60">
//           <div className="flex items-center justify-between">
//             <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
//               {result.is_duplicate ? (
//                 <>
//                   <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-200">
//                     <AlertTriangle className="h-5 w-5 text-white" />
//                   </div>
//                   <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
//                     Potential Duplicate Detected
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-green-200">
//                     <CheckCircle className="h-5 w-5 text-white" />
//                   </div>
//                   <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
//                     No Duplicates Found
//                   </span>
//                 </>
//               )}
//             </DialogTitle>
//           </div>
//         </DialogHeader>

//         <div className="overflow-y-auto pr-2 space-y-6 max-h-[calc(85vh-120px)]">
//           {/* Status Alert */}
//           <Alert
//             className={`border-2 shadow-lg flex items-center gap-4 px-4 py-3 ${
//               result.is_duplicate
//                 ? "border-red-200 bg-red-50"
//                 : "border-emerald-200 bg-emerald-50"
//             }`}
//           >
//             <div
//               className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
//                 result.is_duplicate
//                   ? "bg-red-100 text-red-600"
//                   : "bg-emerald-100 text-emerald-600"
//               }`}
//             >
//               {result.is_duplicate ? (
//                 <AlertTriangle className="h-5 w-5" />
//               ) : (
//                 <CheckCircle className="h-5 w-5" />
//               )}
//             </div>

//             <AlertDescription
//               className={`text-sm leading-relaxed ${
//                 result.is_duplicate ? "text-red-800" : "text-emerald-800"
//               }`}
//             >
//               {result.is_duplicate
//                 ? `This issue appears to be a duplicate. One or more similar issues exceed the ${
//                     result.duplicate_threshold * 100
//                   }% similarity threshold.`
//                 : `This issue appears to be unique. No similar issues exceed the ${
//                     result.duplicate_threshold * 100
//                   }% similarity threshold.`}
//             </AlertDescription>
//           </Alert>


//           {/* Issue Summary */}
//           <Card className="border border-slate-200 shadow-md bg-white overflow-hidden">
//             <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4 m-0">
//               <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
//                 <FileText className="h-4 w-4 text-slate-600" />
//                 Issue Summary
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-4 space-y-4">
//               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
//                 <div className="flex items-center gap-2">
//                   <span className="font-semibold text-slate-700 text-sm">Issue ID:</span>
//                   <span className="font-mono text-xs bg-white px-3 py-1.5 rounded-md border border-slate-300 shadow-sm">
//                     {result.new_issue_id}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => copyToClipboard(result.new_issue_id)}
//                   className="p-2 hover:bg-slate-200 rounded-md transition-colors duration-200"
//                   title="Copy Issue ID"
//                 >
//                   <Copy className="h-4 w-4 text-slate-500" />
//                 </button>
//               </div>
//               <div>
//                 <span className="font-semibold text-slate-700 mb-2 block text-sm">Description:</span>
//                 <div className="relative">
//                   <p className="text-slate-900 bg-white p-4 rounded-lg border border-slate-200 leading-relaxed shadow-sm text-sm">
//                     {result.new_issue_description}
//                   </p>
//                   <button
//                     onClick={() => copyToClipboard(result.new_issue_description)}
//                     className="absolute top-2 right-2 p-2 hover:bg-slate-200 rounded-md transition-colors duration-200"
//                     title="Copy Description"
//                   >
//                     <Copy className="h-4 w-4 text-slate-500" />
//                   </button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Similar Issues */}
//           {topSimilarIssues.length > 0 && (
//             <Card className="border border-slate-200 shadow-md bg-white overflow-hidden">
//               <CardHeader className="bg-blue-50 border-b border-blue-200 pb-4 m-0">
//                 <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
//                   <TrendingUp className="h-4 w-4 text-blue-600" />
//                   Top 3 Most Similar Issues
//                 </CardTitle>
//                 <CardDescription className="text-slate-600 text-sm">
//                   Most similar issues found in the system, ranked by similarity score
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="pt-4 space-y-6">
//                 {topSimilarIssues.map((issue, index) => (
//                   <div key={issue.ticket_id} className="relative border border-slate-200 rounded-xl p-5 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-300">
//                     <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
//                       {index + 1}
//                     </div>

//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex-1">
//                         <h4 className="font-semibold text-slate-900 text-base mb-1">{issue.ticket_id}</h4>
//                       </div>
//                       <div className="flex items-center gap-3 ml-4">
//                         <Badge className={`${getSimilarityColor(issue.similarity_score)} shadow-md border-2 px-3 py-1.5 font-medium flex items-center gap-1.5 text-xs`}>
//                           {getSimilarityIcon(issue.similarity_score)}
//                           {getSimilarityLabel(issue.similarity_score)}
//                         </Badge>
//                         <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md whitespace-nowrap">
//                           {(issue.similarity_score * 100).toFixed(1)}%
//                         </span>
//                       </div>
//                     </div>

//                     <Separator className="mb-4" />

//                     <div className="relative">
//                       <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
//                         {issue.description}
//                       </p>
//                       <button
//                         onClick={() => copyToClipboard(issue.description)}
//                         className="absolute top-2 right-2 p-2 hover:bg-slate-200 rounded-md transition-colors duration-200"
//                         title="Copy Description"
//                       >
//                         <Copy className="h-4 w-4 text-slate-500" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           )}

//           {/* RCA Section */}
//           <Card className="border border-slate-200 shadow-md bg-white overflow-hidden">
//             <CardHeader className="bg-purple-50 border-b border-purple-200 pb-4 m-0">
//               <div className="flex justify-between items-center">
//                 <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
//                   <Zap className="h-4 w-4 text-purple-600" />
//                   Root Cause Analysis
//                 </CardTitle>
//                 <div className="flex justify-center items-center">
//                   <GenerateRCAButton
//                     currentIssueDescription={result.new_issue_description}
//                     similarIssues={topSimilarIssues}
//                     onResult={(data) => {
//                       setRcaSuggestion(data);
//                       setRcaError(null);
//                     }}
//                     onError={(msg) => {
//                       setRcaSuggestion(null);
//                       setRcaError(msg);
//                     }}
//                   />
//                 </div>
//               </div>
//             </CardHeader>

//             <CardContent className="pt-4">
//               {rcaError && (
//                 <Alert className="border-red-200 bg-red-50 shadow shadow-red-100 mb-4">
//                   <AlertTriangle className="h-4 w-4 text-red-600" />
//                   <AlertDescription className="text-red-800 font-medium text-sm">{rcaError}</AlertDescription>
//                 </Alert>
//               )}

//               {rcaSuggestion ? (
//                 <div className="space-y-6">
//                   {rcaSuggestion.rca_category && (
//                     <div>
//                       <h4 className="font-semibold text-purple-800 mb-2 text-sm">Category</h4>
//                       <p className="text-slate-800 text-sm">{rcaSuggestion.rca_category}</p>
//                     </div>
//                   )}
//                   {rcaSuggestion.rca_detail && (
//                     <div>
//                       <h4 className="font-semibold text-blue-800 mb-2 text-sm">Details</h4>
//                       <p className="text-slate-800 text-sm">{rcaSuggestion.rca_detail}</p>
//                     </div>
//                   )}
//                   {rcaSuggestion.explanation && (
//                     <div>
//                       <h4 className="font-semibold text-emerald-800 mb-2 text-sm">Explanation</h4>
//                       <p className="text-slate-800 text-sm">{rcaSuggestion.explanation}</p>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <Zap className="h-8 w-8 text-purple-600" />
//                   </div>
//                   <p className="text-slate-600 text-xs">Click "Generate Potential RCA" to analyze potential root causes</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

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


