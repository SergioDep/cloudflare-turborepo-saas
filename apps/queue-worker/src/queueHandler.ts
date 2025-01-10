import type {
  AllQueueMessages,
  QueueMessageType,
} from "@repo/queue-worker/modules/queue/lib/types";
import {
  assertActiveRunningTask,
  updateTask,
  updateTaskWithLog,
} from "@repo/queue-worker/modules/queue/db";
import { queueHandlers } from "@repo/queue-worker/modules/queue/lib/handlersRegistry";
import { calculateQueueRetryDelaySeconds } from "@repo/queue-worker/modules/queue/utils";

export const queueHandler = async (
  batch: MessageBatch<AllQueueMessages[QueueMessageType]>,
  env: CloudflareEnv,
) => {
  for (const message of batch.messages) {
    const data = message.body;
    try {
      const handler = queueHandlers[data.type];

      if (!handler) {
        message.ack();

        // Handle unknown message types
        console.warn(`No handler found for message type "${data.type}".`);

        await updateTaskWithLog(
          data.taskId,
          { status: "skipped" },
          {
            taskId: data.taskId,
            level: "error",
            message: `Unknown message type: ${data.type}`,
          },
        );

        continue;
      }

      await assertActiveRunningTask(data.taskId);

      await handler(message, env);

      message.ack();
    } catch (error) {
      console.error(`Error processing message type "${data.type}":`, error);

      const maxAttempts = 3;
      if (message.attempts >= maxAttempts) {
        message.ack();

        await updateTaskWithLog(
          data.taskId,
          { status: "failed", retries: message.attempts },
          {
            taskId: data.taskId,
            level: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        );
      } else {
        await updateTask(
          data.taskId,
          {
            status: "retrying",
            retries: message.attempts,
          },
          {
            taskId: data.taskId,
            level: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unknown error" +
                  `. Retrying in 30 seconds. Attempt ${message.attempts}/${maxAttempts}`,
          },
        );

        message.retry({
          delaySeconds: calculateQueueRetryDelaySeconds(message.attempts),
        });
      }
    }
  }
};
