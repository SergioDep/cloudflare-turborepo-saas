"use server";

import { queueQueueWorker } from "@/modules/queue/server/api/queueWorker";

export async function getTaskStatusAction({ taskId }: { taskId: string }) {
  return await queueQueueWorker.getTaskStatus({
    param: {
      taskId,
    },
  });
}
