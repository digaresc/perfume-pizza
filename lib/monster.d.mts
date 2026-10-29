export declare const MONSTER_NAME: string;
export declare const CERTIFICATIONS: string[];
export interface PullRequestRef {
  number: number;
  author: string;
  title?: string;
  branch?: string;
}
export declare function reviewPullRequest(pr: PullRequestRef): { complaints: string[]; verdict: string };
export declare function horseName(login: string): string;
export declare function reviewMarkdown(pr: PullRequestRef): string;
