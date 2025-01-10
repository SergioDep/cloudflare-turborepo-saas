import { index, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { baseColumns } from "@repo/db/modules/base/utils";
import { crmConversationsTable } from "@repo/db/modules/crm/schema/conversations";
import { crmTableCreator } from "@repo/db/modules/crm/utils";
import { registerDbSchema } from "@repo/db/schemaRegistry";
import { MessageTypeSchema } from "@repo/validators/modules/crm/message-type";

export const crmMessagesTable = crmTableCreator(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    remoteMessageId: text("remote_message_id").notNull(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => crmConversationsTable.id),
    messageType: text("message_type", {
      enum: MessageTypeSchema.options,
    }).notNull(),
    from: text("from").notNull(),
    fromMe: integer("from_me", { mode: "boolean" }).notNull(),
    messageTimestamp: integer("message_timestamp", { mode: "timestamp_ms" }),
    content: text("text_content"),
    // mediaId
    ...baseColumns,
  },
  (table) => ({
    remoteMessageIdIndex: index("remoteMessageIdIndex").on(
      table.remoteMessageId,
    ),
  }),
);

export const insertCrmMessageSchema = createInsertSchema(crmMessagesTable);
export const selectCrmMessageSchema = createSelectSchema(crmMessagesTable);

export type InsertCrmMessageModel = z.infer<typeof insertCrmMessageSchema>;
export type SelectCrmMessageModel = z.infer<typeof selectCrmMessageSchema>;

const schemas = {
  crmMessagesTable,
};
type Schemas = typeof schemas;

// Augment the DbTablesSchema interface
declare module "@repo/db/types" {
  interface DbTablesSchema extends Schemas {}
}

registerDbSchema(schemas);
