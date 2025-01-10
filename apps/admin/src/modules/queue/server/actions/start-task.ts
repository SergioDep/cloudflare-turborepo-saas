"use server";

import { queueQueueWorker } from "@/modules/queue/server/api/queueWorker";

export async function startTaskAction({ taskId }: { taskId: string }) {
  return await queueQueueWorker.startTask({
    json: {
      taskId,
    },
  });
}
