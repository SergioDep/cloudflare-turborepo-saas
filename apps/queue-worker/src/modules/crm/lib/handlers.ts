import type { SelectQueueTask } from "@repo/queue-worker/modules/queue/lib/types";
import { db } from "@repo/db/client";
import { eq } from "@repo/db/drizzle";
import { queueTasksTable } from "@repo/db/modules/queue/schema/tasks";
import {
  completeTask,
  updateTaskWithLog,
} from "@repo/queue-worker/modules/queue/db";
import { registerQueueHandler } from "@repo/queue-worker/modules/queue/lib/handlersRegistry";

registerQueueHandler("sync-data", async (message, env) => {
  const data = message.body;

  const parentTaskId = data.taskId;

  const childTasks = (await db.query.queueTasksTable.findMany({
    where: eq(queueTasksTable.parentTaskId, parentTaskId),
  })) as SelectQueueTask[];

  for (const task of childTasks) {
    if (task.type === "sync-data.data-chunk") {
      await env.MY_QUEUE.send(
        {
          taskId: task.id,
          type: task.type,
          ...task.data,
        },
        { contentType: "json", delaySeconds: 10 },
      );
    } else {
      // Handle other task types
      continue;
    }
  }
});

registerQueueHandler("sync-data.data-chunk", async (message, env) => {
  const data = message.body;

  await updateTaskWithLog(data.taskId, {
    status: "running",
  });

  // get messages from kv
  const kvKey = data.chunkId;
  const messagesJson = await env.MY_KV.get(kvKey);
  if (!messagesJson) {
    throw new Error(`No messages found in KV for key ${kvKey}`);
  }

  const messages = JSON.parse(messagesJson) as any[];

  console.log(`Processing ${messages.length} messages`);

  // await dbAutoBatch(
  //   {
  //     items: messagesToInsert,
  //   },
  //   (chunk) => db.insert(crmMessagesTable).values(chunk).onConflictDoNothing(),
  // );

  console.log(`Processed ${messages.length} messages`);

  await completeTask(data.taskId);

  await env.MY_KV.delete(kvKey);
});
