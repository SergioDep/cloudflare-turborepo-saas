import { z } from "zod";

import { MessageTypeSchema } from "@repo/validators/modules/crm/message-type";

export const IncomingMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  messageType: MessageTypeSchema,
  message: z.any(),
  messageTimestamp: z.number(),
  instanceId: z.string(),
  source: z
    .enum(["ios", "android", "web", "unknown", "desktop"])
    .default("unknown"),
});
