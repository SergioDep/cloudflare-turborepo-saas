import { z } from "zod";

export const queueTaskStatusSchema = z.enum([
  "queued", // Task is in the queue, waiting to be processed
  "running", // Task is actively being processed
  "retrying", // Task failed but is scheduled for retry
  "completed", // Task successfully finished
  "failed", // Task failed and won't be retried
  "cancelled", // Task was explicitly cancelled
  "skipped", // Task was skipped (e.g., due to dependency issues)
]);
