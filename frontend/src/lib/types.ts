export interface JobResult {
  title: string;
  duration?: number;
  transcript: string;
  summary: string;
  mode?: string;
}

export interface JobState {
  id: string;
  type: "url" | "upload";
  status: "queued" | "processing" | "completed" | "failed";
  step: number;
  step_name: string;
  progress: number;
  message: string;
  result?: JobResult | null;
  error?: string | null;
}

export interface HistoryItem {
  job_id: string;
  title: string;
  duration?: number;
  timestamp: number;
  summary: string;
  transcript: string;
  mode: string;
}
