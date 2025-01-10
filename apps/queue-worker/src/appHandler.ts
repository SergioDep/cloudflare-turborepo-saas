import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";

import { injectDrizzleDbEnv } from "@repo/db/client";
import { appFactory } from "@repo/queue-worker/modules/base/lib/factory";
import { getRegisteredRoutes } from "@repo/queue-worker/modules/base/lib/routesRegistry";
import { AppLogger } from "@repo/queue-worker/utils/app-logger";
import { isAppError } from "@repo/validators/modules/base/app-error";

const app = appFactory
  .createApp()
  .use("/*", cors())
  .use(async (ctx, next) => {
    injectDrizzleDbEnv(ctx.env.DATABASE);

    await next();
  })
  .use(logger())
  .onError((err, ctx) => {
    if (isAppError(err)) {
      const errorResponse = {
        error: {
          type: err.errorType,
          message: err.message,
          details: err.details,
        },
      };

      // Log the error with relevant details
      AppLogger.error(`AppError: ${err.errorType} - ${err.message}`, {
        details: err.details,
        statusCode: err.statusCode,
      });

      return ctx.json(errorResponse, err.statusCode);
    } else if (err instanceof HTTPException) {
      AppLogger.error("HTTPException occurred.", {
        error: err.message,
        status: err.status,
      });
      return ctx.json({ error: err.message }, err.status);
    }

    // Handle unexpected errors
    AppLogger.error("Unexpected error occurred.", {
      error: (err as Error).message,
      stack: (err as Error).stack,
    });
    return ctx.json({ error: "Internal Server Error" }, 500);
  });

// Dynamically register all module routes
const routes = getRegisteredRoutes();
routes.forEach(({ prefix, routes: route }) => {
  app.route(prefix, route);
});

export const appHandler = app.fetch;
