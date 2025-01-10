import type { InsertQueueTaskLogsModel } from "@repo/db/modules/queue/schema/task-logs";
import type { InsertQueueTasksModel } from "@repo/db/modules/queue/schema/tasks";
import type { FinalQueueTaskState } from "@repo/db/modules/queue/utils";
import type {
  InsertQueueTask,
  SelectQueueTask,
} from "@repo/queue-worker/modules/queue/lib/types";
import { db } from "@repo/db/client";
import {
  alias,
  and,
  eq,
  inArray,
  isNull,
  ne,
  notInArray,
  sql,
} from "@repo/db/drizzle";
import { queueTaskLogsTable } from "@repo/db/modules/queue/schema/task-logs";
import { queueTasksTable } from "@repo/db/modules/queue/schema/tasks";
import {
  finalQueueTaskStates,
  isFinalQueueTaskState,
} from "@repo/db/modules/queue/utils";
import { AppError } from "@repo/validators/modules/base/app-error";
import { queueTaskStatusSchema } from "@repo/validators/modules/queue/task-status";

export async function assertActiveRunningTask(taskId: SelectQueueTask["id"]) {
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

  if (isFinalQueueTaskState(task.status)) {
    throw new AppError("base.validation", {
      message: "Task is already in a final state",
      details: {
        data: task,
      },
    });
  }

  return task as Omit<SelectQueueTask, "status"> & {
    status: Exclude<SelectQueueTask["status"], FinalQueueTaskState>;
  };
}

export async function saveTaskLog(data: InsertQueueTaskLogsModel) {
  await db.insert(queueTaskLogsTable).values(data);
}

export async function saveTaskLogs(data: InsertQueueTaskLogsModel[]) {
  await db.insert(queueTaskLogsTable).values(data);
}

export async function saveNewTask(values: InsertQueueTask) {
  const [task] = await db
    .insert(queueTasksTable)
    .values(prepareTaskValues(values))
    .returning({
      insertedId: queueTasksTable.id,
    });

  if (!task) {
    throw new AppError("base.database.query-error", {
      details: {
        entity: "queue_task",
        context: "insert",
      },
      message: "Failed to insert task",
    });
  }

  await saveTaskLog({
    taskId: task.insertedId,
    level: "info",
    message: `Task created with type ${values.type}`,
  });

  return task.insertedId;
}

function prepareTaskValues<
  T extends Partial<InsertQueueTasksModel> | InsertQueueTask,
>(values: T[]): T[];
function prepareTaskValues<
  T extends Partial<InsertQueueTasksModel> | InsertQueueTask,
>(values: T): T;
function prepareTaskValues<
  T extends Partial<InsertQueueTasksModel> | InsertQueueTask,
>(values: T | T[]): T | T[] {
  if (Array.isArray(values)) {
    return values.map((value) => ({
      ...value,
      ...(value.status === "running" ? { startedAt: new Date() } : {}),
      ...(value.status === "completed" ? { completedAt: new Date() } : {}),
    })) as T[];
  }

  return {
    ...values,
    ...(values.status === "running" ? { startedAt: new Date() } : {}),
    ...(values.status === "completed" ? { completedAt: new Date() } : {}),
  } satisfies T;
}

export async function saveTasks(values: InsertQueueTask[]) {
  const tasks = await db
    .insert(queueTasksTable)
    .values(prepareTaskValues(values))
    .returning({
      insertedId: queueTasksTable.id,
      type: queueTasksTable.type,
    });

  if (!tasks.length) {
    throw new AppError("base.database.query-error", {
      details: {
        entity: "queue_task",
        context: "insert",
      },
      message: "Failed to insert tasks",
    });
  }

  await saveTaskLogs(
    tasks.map((t) => ({
      taskId: t.insertedId,
      level: "info",
      message: `Task created with type ${t.type}`,
    })),
  );

  return tasks.map((t) => t.insertedId);
}

export async function startTask(
  taskId: SelectQueueTask["id"],
  log?: InsertQueueTaskLogsModel,
) {
  return await updateTaskWithLog(
    taskId,
    {
      status: "running",
    },
    log,
  );
}

export async function cancelTask(
  taskId: SelectQueueTask["id"],
  log?: InsertQueueTaskLogsModel,
  cascade = false,
) {
  const task = await updateTaskWithLog<true>(
    taskId,
    {
      status: "cancelled",
    },
    log,
  );

  // If the task is in a final state, update all child tasks recursively
  if (task.status === "cancelled" && cascade) {
    // Update all child tasks recursively

    const childTaskTable = alias(queueTasksTable, "child");

    // https://github.com/drizzle-team/drizzle-orm/pull/1405 <- this PR will allow to do this better
    const recursiveQuery = sql`
    WITH RECURSIVE task_tree AS (
      ${db
        .select({
          id: queueTasksTable.id,
          parentTaskId: queueTasksTable.parentTaskId,
        })
        .from(queueTasksTable)
        .where(eq(queueTasksTable.id, taskId))
        .unionAll(
          db
            .select({
              id: childTaskTable.id,
              parentTaskId: childTaskTable.parentTaskId,
            })
            .from(childTaskTable)
            .innerJoin(
              sql`task_tree p`,
              eq(sql`p.id`, childTaskTable.parentTaskId),
            ),
        )
        .getSQL()}
    )
    ${db
      .update(queueTasksTable)
      .set({
        status: "cancelled",
      })
      .where(
        and(
          inArray(
            queueTasksTable.id,
            sql`(SELECT id FROM task_tree WHERE id != ${taskId})`,
          ),
          notInArray(queueTasksTable.status, finalQueueTaskStates),
        ),
      )
      .getSQL()};
  `;

    await db.run(recursiveQuery);
  }
}

export async function completeTask(
  taskId: SelectQueueTask["id"],
  log?: InsertQueueTaskLogsModel,
  cascade = true,
): Promise<void> {
  const task = await updateTaskWithLog<true>(
    taskId,
    {
      status: "completed",
    },
    log,
  );

  // If the task is in a final state, update all child tasks recursively
  if (task.status === "completed" && cascade) {
    const parentTaskTable = alias(queueTasksTable, "parent");
    const siblingTaskTable = alias(queueTasksTable, "sibling");

    // https://github.com/drizzle-team/drizzle-orm/pull/1405
    const recursiveQuery = sql`
    WITH RECURSIVE
    completed_tasks(id, parent_task_id) AS (
    -- Base case: Start with the task being completed
    ${db
      .select({
        id: queueTasksTable.id,
        parentTaskId: queueTasksTable.parentTaskId,
      })
      .from(queueTasksTable)
      .where(eq(queueTasksTable.id, taskId))
      .unionAll(
        db
          .select({
            id: parentTaskTable.id,
            parentTaskId: parentTaskTable.parentTaskId,
          })
          .from(parentTaskTable)
          .innerJoin(
            sql`completed_tasks child_task`,
            sql`child_task.parent_task_id = ${parentTaskTable.id}`,
          )
          .leftJoin(
            siblingTaskTable,
            and(
              eq(siblingTaskTable.parentTaskId, parentTaskTable.id),
              ne(siblingTaskTable.id, "child_task.id"),
              ne(siblingTaskTable.status, queueTaskStatusSchema.enum.completed),
            ),
          )
          .where(isNull(siblingTaskTable.id)),
      )
      .getSQL()}
    )
      ${db
        .update(queueTasksTable)
        .set({
          status: queueTaskStatusSchema.enum.completed,
        })
        .where(
          inArray(queueTasksTable.id, sql`(SELECT id FROM completed_tasks)`),
        )
        .getSQL()};
    `;

    await db.run(recursiveQuery);
  }
}

type SpecialInsertQueueTasks<S extends InsertQueueTask["status"]> = Omit<
  InsertQueueTask,
  "status"
> & {
  status: S;
};
export async function updateTaskWithLog<ShowAllStatus extends boolean = false>(
  taskId: SelectQueueTask["id"],
  data: Partial<
    ShowAllStatus extends true
      ? SpecialInsertQueueTasks<InsertQueueTask["status"]>
      : SpecialInsertQueueTasks<
          Exclude<InsertQueueTask["status"], "cancelled" | "completed">
        >
  >,
  log?: InsertQueueTaskLogsModel,
) {
  return await updateTask(
    taskId,
    data,
    log ?? {
      taskId,
      level: "info",
      message: `Task status changed to ${data.status}`,
    },
  );
}

export async function updateTask(
  taskId: SelectQueueTask["id"],
  values: Partial<InsertQueueTasksModel>,
  taskLog?: InsertQueueTaskLogsModel,
  cascade = false,
) {
  if (Object.keys(values).length === 0) {
    throw new AppError("base.database.query-error", {
      details: {
        entity: "queue_task",
        context: "update",
      },
      message: "No values to update",
    });
  }

  const [task] = await db
    .update(queueTasksTable)
    .set(prepareTaskValues(values))
    .where(eq(queueTasksTable.id, taskId))
    .returning();

  if (taskLog) {
    await saveTaskLog(taskLog);
  }

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

  return task as SelectQueueTask;
}
