// API service for communicating with FastAPI backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface IssueRequest {
  id: string;
  description: string;
}

export interface SimilarIssue {
  ticket_id: string;
  description: string;
  similarity_score: number;
}

export interface DuplicateDetectionResponse {
  new_issue_id: string;
  new_issue_description: string;
  similar_issues: SimilarIssue[];
  is_duplicate: boolean;
  duplicate_threshold: number;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface ApiError {
  detail: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Check if the API is healthy and responsive
   */
  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    return this.handleResponse<HealthResponse>(response);
  }

  /**
   * Detect duplicate issues for a given issue
   */
  async detectDuplicates(issue: IssueRequest): Promise<DuplicateDetectionResponse> {
    const response = await fetch(`${this.baseUrl}/detect-duplicates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue),
    });

    return this.handleResponse<DuplicateDetectionResponse>(response);
  }

  /**
   * Add a new issue to the knowledge base
   */
  // async addIssue(issue: IssueRequest): Promise<{ message: string }> {
  //   const response = await fetch(`${this.baseUrl}/add-issue`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(issue),
  //   });

  //   return this.handleResponse<{ message: string }>(response);
  // }

  /**
   * Basic connectivity test
   */
  async ping(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/`);
    return this.handleResponse<HealthResponse>(response);
  }
}

// Export a singleton instance
export const apiService = new ApiService();

// Export the class for custom instances if needed
export default ApiService;
