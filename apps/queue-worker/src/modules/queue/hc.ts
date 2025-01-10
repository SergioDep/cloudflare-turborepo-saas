import { hc } from "hono/client";

import { createHc } from "@repo/queue-worker/modules/base/utils/hc";
import { queueRoutes } from "@repo/queue-worker/modules/queue/routes";

// this is a trick to calculate the type when compiling
const _client = hc<typeof queueRoutes.routes>("");
type Client = typeof _client;

export const queueHC = createHc<Client>(queueRoutes.prefix);
