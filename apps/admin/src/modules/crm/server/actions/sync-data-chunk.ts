"use server";

import { crmQueueWorker } from "@/modules/crm/server/api/queueWorker";
import { z } from "zod";

import { IncomingMessageSchema } from "@repo/validators/modules/crm/incoming-message";

export async function syncDataChunkAction({
  parentTaskId,
  chunkIndex,
  messages,
}: {
  parentTaskId: string;
  chunkIndex: number;
  messages: z.infer<typeof IncomingMessageSchema>[];
}) {
  const chunkId = `crm-sync-data-chunk-${parentTaskId}-${chunkIndex}`;

  // Store messages chunk in KV
  // const kvKey = chunkId;
  // await process.env.MY_KV.put(kvKey, JSON.stringify(messages), {
  //   // expirationTtl: 3600, // Optional: Set TTL to auto-expire data after 1 hour
  // });

  const data = await crmQueueWorker.syncDataChunk({
    json: {
      parentTaskId,
      chunkId,
    },
  });

  return data;
}
