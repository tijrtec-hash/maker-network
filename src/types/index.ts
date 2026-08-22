export interface Video {
  id: string;
  title: string;
  embed_url: string;
  thumbnail_url?: string;
  status: "pending" | "approved" | "rejected";
  submitted_by?: string;
  created_at: string;
}

export interface Doc {
  id: string;
  title: string;
  cover_url?: string;
  file_url: string;
  status: "pending" | "approved" | "rejected";
  submitted_by?: string;
  created_at: string;
}

export interface Prompt {
  id: string;
  title: string;
  cover_url?: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  submitted_by?: string;
  created_at: string;
}

export type ContentType = "video" | "doc" | "prompt";

export type ContentStatus = "pending" | "approved" | "rejected";

export interface PendingItem {
  id: string;
  type: ContentType;
  title: string;
  thumbnail_url?: string;
  submitted_by: string;
  submitted_ago: string;
  status: ContentStatus;
}
