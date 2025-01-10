import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import type {
  AllQueueMessages,
  QueueMessageType,
} from "@repo/queue-worker/modules/queue/lib/types";
import { db } from "@repo/db/client";
import { eq } from "@repo/db/drizzle";
import { queueTasksTable } from "@repo/db/modules/queue/schema/tasks";
import { appFactory } from "@repo/queue-worker/modules/base/lib/factory";
import { registerRoute } from "@repo/queue-worker/modules/base/lib/routesRegistry";
import {
  assertActiveRunningTask,
  cancelTask,
  startTask,
} from "@repo/queue-worker/modules/queue/db";
import { AppError } from "@repo/validators/modules/base/app-error";

export const queueRoutes = registerRoute({
  prefix: "/queue",
  routes: appFactory
    .createApp()
    .get(
      "/status/:taskId",
      zValidator(
        "param",
        z.object({
          taskId: z.string(),
        }),
      ),
      async (ctx) => {
        const { taskId } = ctx.req.valid("param");

        const task = await db.query.queueTasksTable.findFirst({
          where: eq(queueTasksTable.id, taskId),
        });

        if (!task) {
          throw new AppError("base.validation.not-found", {
            message: "Task not found",
            details: {
              entity: "queue_task",
              context: {
                taskId,
              },
            },
          });
        }

        return ctx.json({
          message: "Task status",
          task,
        });
      },
    )
    .post(
      "/cancel",
      zValidator(
        "json",
        z.object({
          taskId: z.string(),
        }),
      ),
      async (ctx) => {
        const { taskId } = ctx.req.valid("json");

        await assertActiveRunningTask(taskId);

        await cancelTask(taskId);

        return ctx.json(
          {
            message: "Task cancelled",
          },
          200,
        );
      },
    )
    .post(
      "/start",
      zValidator(
        "json",
        z.object({
          taskId: z.string(),
        }),
      ),
      async (ctx) => {
        const { taskId } = ctx.req.valid("json");

        const task = await assertActiveRunningTask(taskId);

        if (task.status !== null) {
          throw new AppError("base.api.bad-request", {
            message: "Task is already started",
          });
        }

        await startTask(taskId);

        await ctx.env.MY_QUEUE.send({
          type: task.type,
          taskId,
          ...task.data,
        } as AllQueueMessages[QueueMessageType]);

        return ctx.json(
          {
            message: "Task started",
          },
          200,
        );
      },
    ),
});
