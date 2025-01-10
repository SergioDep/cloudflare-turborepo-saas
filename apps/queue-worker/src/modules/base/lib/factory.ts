import { createFactory } from "hono/factory";

import type {
  AllQueueMessages,
  QueueMessageType,
} from "@repo/queue-worker/modules/queue/lib/types";

export const appFactory = createFactory<{
  Bindings: Omit<CloudflareEnv, "MY_QUEUE"> & {
    MY_QUEUE: Queue<AllQueueMessages[QueueMessageType]>;
  };
}>();

export type HonoApp = ReturnType<(typeof appFactory)["createApp"]>;
