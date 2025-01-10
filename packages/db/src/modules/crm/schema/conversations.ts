import type { z } from "zod";
import { index, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns } from "@repo/db/modules/base/utils";
import { crmAccountsTable } from "@repo/db/modules/crm/schema/accounts";
import { crmContactsTable } from "@repo/db/modules/crm/schema/contacts";
import { crmTableCreator } from "@repo/db/modules/crm/utils";
import { registerDbSchema } from "@repo/db/schemaRegistry";

export const crmConversationsTable = crmTableCreator(
  "conversation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    remoteConversationId: text("remote_conversation_id").notNull(),
    contactId: text("contact_id")
      .notNull()
      .references(() => crmContactsTable.id),
    accountId: text("account_id")
      .notNull()
      .references(() => crmAccountsTable.id),
    ...baseColumns,
  },
  (table) => ({
    remoteConversationIdIndex: index("remoteConversationIdIndex").on(
      table.remoteConversationId,
    ),
  }),
);

export const insertCrmConversationSchema = createInsertSchema(
  crmConversationsTable,
);
export const selectCrmConversationSchema = createSelectSchema(
  crmConversationsTable,
);

export type InsertCrmConversationModel = z.infer<
  typeof insertCrmConversationSchema
>;
export type SelectCrmConversationModel = z.infer<
  typeof selectCrmConversationSchema
>;

const schemas = {
  crmConversationsTable,
};
type Schemas = typeof schemas;

// Augment the DbTablesSchema interface
declare module "@repo/db/types" {
  interface DbTablesSchema extends Schemas {}
}

registerDbSchema(schemas);
