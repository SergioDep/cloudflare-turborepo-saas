import { hc } from "hono/client";

import { createHc } from "@repo/queue-worker/modules/base/utils/hc";
import { crmRoutes } from "@repo/queue-worker/modules/crm/routes";

// this is a trick to calculate the type when compiling [https://hono.dev/docs/guides/rpc]
const _client = hc<typeof crmRoutes.routes>("");
type Client = typeof _client;

export const crmHC = createHc<Client>(crmRoutes.prefix);
