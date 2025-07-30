export interface SimilarIssue {
	ticket_id: string;
	description: string;
	similarity_score: number;
	rca_category?: string
	rca_details?: string
  }

  export interface DuplicateDetectionResponse {
	new_issue_id: string;
	new_issue_description: string;
	similar_issues: SimilarIssue[];
	is_duplicate: boolean;
	duplicate_threshold: number;
  }
