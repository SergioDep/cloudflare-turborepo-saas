import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import type { z } from "zod";
import { relations } from "drizzle-orm";
import { index, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { usersTable } from "@repo/db/modules/auth/schema/users";
import { baseColumns } from "@repo/db/modules/base/utils";
import { queueTableCreator } from "@repo/db/modules/queue/utils";
import { registerDbSchema } from "@repo/db/schemaRegistry";
import { queueTaskStatusSchema } from "@repo/validators/modules/queue/task-status";

export const queueTasksTable = queueTableCreator(
  "task",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    parentTaskId: text("parent_task_id").references(
      (): AnySQLiteColumn => queueTasksTable.id,
    ),
    userId: text("user_id").references(() => usersTable.id),
    type: text("type").notNull(),
    status: text("status", {
      enum: queueTaskStatusSchema.options,
    }),
    retries: integer("attempts").default(0).notNull(),
    maxRetries: integer("max_attempts").default(3).notNull(),
    totalSteps: integer("total_steps"),
    estimatedDurationSeconds: integer("estimated_time", {
      mode: "timestamp",
    }),
    data: text("data", { mode: "json" }).notNull(),
    ...baseColumns,
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
  },
  (table) => ({
    userIdIndex: index("user_id_index").on(table.userId),
    parentTaskIdIndex: index("parent_task_id_index").on(table.parentTaskId),
    typeStatusIndex: index("type_status_index").on(table.type, table.status),
  }),
);

export const queueTasksRelations = relations(
  queueTasksTable,
  ({ one, many }) => ({
    parentTask: one(queueTasksTable, {
      fields: [queueTasksTable.parentTaskId],
      references: [queueTasksTable.id],
      relationName: "parentTask",
    }),
    subTasks: many(queueTasksTable, {
      relationName: "subTasks",
    }),
    user: one(usersTable, {
      fields: [queueTasksTable.userId],
      references: [usersTable.id],
      relationName: "user",
    }),
  }),
);

export const insertQueueTaskschema = createInsertSchema(queueTasksTable);
export const selectQueueTaskschema = createSelectSchema(queueTasksTable);

export type InsertQueueTasksModel = z.infer<typeof insertQueueTaskschema>;
export type SelectQueueTasksModel = z.infer<typeof selectQueueTaskschema>;

const schemas = {
  queueTasksTable,
};
type Schemas = typeof schemas;

// Augment the DbTablesSchema interface
declare module "@repo/db/types" {
  interface DbTablesSchema extends Schemas {}
}

registerDbSchema(schemas);
