import { sqliteTableCreator } from "drizzle-orm/sqlite-core";

import type { SelectQueueTasksModel } from "@repo/db/modules/queue/schema/tasks";

export const queueTableCreator = sqliteTableCreator(
  (name) => `queue_${name.toLowerCase()}`,
);

export const finalQueueTaskStates = [
  "completed",
  "failed",
  "cancelled",
  "skipped",
] as const satisfies SelectQueueTasksModel["status"][];

export type FinalQueueTaskState = (typeof finalQueueTaskStates)[number];

export const isFinalQueueTaskState = (
  x: SelectQueueTasksModel["status"],
): x is FinalQueueTaskState =>
  finalQueueTaskStates.includes(x as FinalQueueTaskState);
