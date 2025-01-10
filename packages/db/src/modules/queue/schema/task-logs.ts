import type { z } from "zod";
import { index, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns } from "@repo/db/modules/base/utils";
import { queueTasksTable } from "@repo/db/modules/queue/schema/tasks";
import { queueTableCreator } from "@repo/db/modules/queue/utils";
import { registerDbSchema } from "@repo/db/schemaRegistry";

export const queueTaskLogsTable = queueTableCreator(
  "task_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    taskId: text("task_id")
      .references(() => queueTasksTable.id)
      .notNull(),
    level: text("level").notNull(),
    message: text("message").notNull(),
    createdAt: baseColumns.createdAt,
  },
  (table) => ({
    taskIdIndex: index("task_id_index").on(table.taskId),
    levelCreatedAtIndex: index("level_created_at_index").on(
      table.level,
      table.createdAt,
    ),
  }),
);

export const insertQueueTaskLogschema = createInsertSchema(queueTaskLogsTable);
export const selectQueueTaskLogschema = createSelectSchema(queueTaskLogsTable);

export type InsertQueueTaskLogsModel = z.infer<typeof insertQueueTaskLogschema>;
export type SelectQueueTaskLogsModel = z.infer<typeof selectQueueTaskLogschema>;

const schemas = {
  queueTaskLogsTable,
};
type Schemas = typeof schemas;

// Augment the DbTablesSchema interface
declare module "@repo/db/types" {
  interface DbTablesSchema extends Schemas {}
}

registerDbSchema(schemas);
