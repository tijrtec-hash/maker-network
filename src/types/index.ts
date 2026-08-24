export interface Video {
  id: string;
  title: string;
  embed_url: string;
  thumbnail_url?: string;
  status: "pending" | "approved" | "rejected";
  submitted_by?: string;
  created_at: string;
  sort_order?: number;
  section?: string | null;
}

export interface Doc {
  id: string;
  title: string;
  cover_url?: string;
  file_url: string;
  status: "pending" | "approved" | "rejected";
  submitted_by?: string;
  created_at: string;
  sort_order?: number;
  section?: string | null;
}

export interface Prompt {
  id: string;
  title: string;
  cover_url?: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  submitted_by?: string;
  created_at: string;
  sort_order?: number;
  section?: string | null;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string | null;
  cover_url?: string | null;
  sort_order?: number;
  section?: string | null;
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
