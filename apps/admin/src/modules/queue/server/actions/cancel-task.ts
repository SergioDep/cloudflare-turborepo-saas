"use server";

import { queueQueueWorker } from "@/modules/queue/server/api/queueWorker";

export async function cancelTaskAction({ taskId }: { taskId: string }) {
  return await queueQueueWorker.cancelTask({
    json: {
      taskId,
    },
  });
}
