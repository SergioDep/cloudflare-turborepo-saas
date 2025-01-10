import type { z } from "zod";
import { text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { usersTable } from "@repo/db/modules/auth/schema/users";
import { baseColumns } from "@repo/db/modules/base/utils";
import { crmTableCreator } from "@repo/db/modules/crm/utils";
import { registerDbSchema } from "@repo/db/schemaRegistry";

export const crmAccountsTable = crmTableCreator("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => usersTable.id),
  accountName: text("account_name").notNull(),
  phoneNumber: text("phone_number"),
  status: text("status", {
    enum: ["active", "inactive"],
  }),
  ...baseColumns,
});

export const insertCrmAccountSchema = createInsertSchema(crmAccountsTable);
export const selectCrmAccountSchema = createSelectSchema(crmAccountsTable);

export type InsertCrmAccountModel = z.infer<typeof insertCrmAccountSchema>;
export type SelectCrmAccountModel = z.infer<typeof selectCrmAccountSchema>;

const schemas = {
  crmAccountsTable,
};
type Schemas = typeof schemas;

// Augment the DbTablesSchema interface
declare module "@repo/db/types" {
  interface DbTablesSchema extends Schemas {}
}

registerDbSchema(schemas);
