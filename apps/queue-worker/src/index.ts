// Import all modules dynamically
import "glob:@repo/queue-worker/modules/**/*.ts";

import { injectDrizzleDbEnv } from "@repo/db/client";
import { appHandler } from "@repo/queue-worker/appHandler";
import { queueHandler } from "@repo/queue-worker/queueHandler";

export function injectServices(env: CloudflareEnv) {
  injectDrizzleDbEnv(env.DATABASE);
  // injectAnotherService(env.ANOTHER_SERVICE);
}

function withInjectedServices<T extends (...args: any[]) => ReturnType<T>>(
  handler: T,
  extractEnv: (args: Parameters<T>) => CloudflareEnv,
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args) => {
    const env = extractEnv(args);
    injectServices(env);

    return handler(...args);
  };
}

export default {
  fetch: withInjectedServices(appHandler, ([_, env]) => env as CloudflareEnv),
  queue: withInjectedServices(queueHandler, ([_, env]) => env),
} satisfies {
  fetch: typeof appHandler;
  queue: typeof queueHandler;
};
