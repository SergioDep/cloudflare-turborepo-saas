import type { z } from "zod";
import { text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns } from "@repo/db/modules/base/utils";
import { crmAccountsTable } from "@repo/db/modules/crm/schema/accounts";
import { crmTableCreator } from "@repo/db/modules/crm/utils";
import { registerDbSchema } from "@repo/db/schemaRegistry";

export const crmContactsTable = crmTableCreator("contact", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  phoneNumber: text("phone_number").notNull(),
  accountId: text("account_id")
    .notNull()
    .references(() => crmAccountsTable.id),
  name: text("name"),
  savedContactName: text("saved_name"),
  ...baseColumns,
});

export const insertCrmContactSchema = createInsertSchema(crmContactsTable);
export const selectCrmContactSchema = createSelectSchema(crmContactsTable);

export type InsertCrmContactModel = z.infer<typeof insertCrmContactSchema>;
export type SelectCrmContactModel = z.infer<typeof selectCrmContactSchema>;

const schemas = {
  crmContactsTable,
};
type Schemas = typeof schemas;

// Augment the DbTablesSchema interface
declare module "@repo/db/types" {
  interface DbTablesSchema extends Schemas {}
}

registerDbSchema(schemas);
