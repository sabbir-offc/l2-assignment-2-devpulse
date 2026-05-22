export interface CreateIssueBody {
  title: string;
  description: string;
  type: string;
}
export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: string;
}
