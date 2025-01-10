import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import type { SelectQueueTask } from "@repo/queue-worker/modules/queue/lib/types";
import { db } from "@repo/db/client";
import { and, eq, notInArray } from "@repo/db/drizzle";
import { usersTable } from "@repo/db/modules/auth/schema/users";
import { crmAccountsTable } from "@repo/db/modules/crm/schema/accounts";
import { queueTasksTable } from "@repo/db/modules/queue/schema/tasks";
import { finalQueueTaskStates } from "@repo/db/modules/queue/utils";
import { appFactory } from "@repo/queue-worker/modules/base/lib/factory";
import { registerRoute } from "@repo/queue-worker/modules/base/lib/routesRegistry";
import {
  assertActiveRunningTask,
  saveNewTask,
} from "@repo/queue-worker/modules/queue/db";
import { AppError } from "@repo/validators/modules/base/app-error";

export const crmRoutes = registerRoute({
  prefix: "/crm",
  routes: appFactory
    .createApp()
    .post(
      "/sync-data/create",
      zValidator(
        "json",
        z.object({
          userId: z.string().nullable(),
          accountId: z.string(),
        }),
      ),
      async (ctx) => {
        const { userId, accountId } = ctx.req.valid("json");

        // Check if there are already running tasks for the user
        if (userId) {
          const user = await db.query.usersTable.findFirst({
            columns: {
              id: true,
            },
            where: eq(usersTable.id, userId),
          });

          if (!user) {
            throw new AppError("base.validation.not-found", {
              message: "User not found",
              details: {
                entity: "user",
                context: {
                  userId,
                },
              },
            });
          }

          const existingRunningTasks = await db.query.queueTasksTable.findMany({
            columns: {
              id: true,
              type: true,
              status: true,
            },
            where: and(
              eq(queueTasksTable.userId, user.id),
              notInArray(queueTasksTable.status, finalQueueTaskStates),
            ),
          });

          if (existingRunningTasks.length > 0) {
            throw new AppError("base.validation", {
              message: "There are already running tasks",
              details: {
                data: existingRunningTasks,
              },
            });
          }
        }

        const account = await db.query.crmAccountsTable.findFirst({
          columns: {
            id: true,
          },
          where: eq(crmAccountsTable.id, accountId),
        });

        if (!account) {
          throw new AppError("base.validation.not-found", {
            message: "Account not found",
            details: {
              entity: "crm_account",
              context: {
                accountId,
              },
            },
          });
        }

        const taskId = await saveNewTask({
          type: "sync-data",
          userId,
          data: {
            accountId,
            userId,
          },
        });

        return ctx.json(
          {
            message: "Task created",
            taskId,
          },
          201,
        );
      },
    )
    .post(
      "/sync-data/add-data-chunk",
      zValidator(
        "json",
        z.object({
          parentTaskId: z.string(),
          chunkId: z.string(),
        }),
      ),
      async (ctx) => {
        const { parentTaskId, chunkId } = ctx.req.valid("json");

        const _parentTask = await assertActiveRunningTask(parentTaskId);
        if (_parentTask.type !== "sync-data") {
          throw new AppError("base.validation", {
            message: "Parent task is not a sync task",
            details: {
              data: _parentTask,
            },
          });
        }
        const parentTask = _parentTask as SelectQueueTask<"sync-data">;

        const accountId = parentTask.data.accountId;

        // create new task
        const taskId = await saveNewTask({
          type: "sync-data.data-chunk",
          parentTaskId,
          data: {
            accountId,
            parentTaskId,
            chunkId,
          },
        });

        return ctx.json(
          {
            message: "Chunk task created",
            taskId,
          },
          201,
        );
      },
    ),
});
