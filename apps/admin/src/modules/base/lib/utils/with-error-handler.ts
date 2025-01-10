import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { AppError } from "@repo/validators/modules/base/app-error";

type Handler = (request: NextRequest, context?: any) => Promise<Response>;

export function withErrorHandler(handler: Handler): Handler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (e) {
      if (e instanceof SyntaxError) {
        return Response.json(
          {
            success: false,
            errors: ["Invalid JSON payload", e.message],
          },
          {
            status: 400,
          },
        );
      }

      if (e instanceof AppError) {
        return Response.json(
          {
            success: false,
            errors: [e.message],
            details: e.details,
          },
          {
            status: e.statusCode,
          },
        );
      }

      if (e instanceof ZodError) {
        return Response.json(
          {
            success: false,
            errors: e.formErrors,
          },
          {
            status: 400,
          },
        );
      }

      return Response.json(
        {
          success: false,
          errors: [e instanceof Error ? e.message : "Internal server error"],
        },
        {
          status: 500,
        },
      );
    }
  };
}
