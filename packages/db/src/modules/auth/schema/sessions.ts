import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { usersTable } from "@repo/db/modules/auth/schema/users";
import { registerDbSchema } from "@repo/db/schemaRegistry";

export const sessionsTable = sqliteTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

const schemas = {
  sessionsTable,
};
type Schemas = typeof schemas;

// Augment the DbTablesSchema interface
declare module "@repo/db/types" {
  interface DbTablesSchema extends Schemas {}
}

registerDbSchema(schemas);
