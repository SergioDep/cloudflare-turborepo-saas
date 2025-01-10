import type { ExtractRecursiveIds, FindRecursivePropValue } from "./utils";

export interface AppErrorDefinitions {
  base: {
    id: "base";
    items: [
      {
        id: "auth";
        items: [
          {
            id: "signin";
            items: [
              {
                id: "invalid-credentials";
                details: {
                  creds: string;
                };
              },
              {
                id: "google";
                items: [
                  {
                    id: "unknown-error";
                  },
                ];
              },
            ];
          },
          {
            id: "signup";
            items: [
              {
                id: "email-already-exists";
                details: {
                  test: string;
                };
              },
            ];
          },
          {
            id: "signout";
            items: [
              {
                id: "unknown-error";
              },
            ];
          },
        ];
      },
      {
        id: "database";
        items: [
          {
            id: "connection-failed";
            details: {
              host: string;
              port: number;
            };
          },
          {
            id: "query-error";
            details: {
              entity: string;
              context: any;
            };
          },
          {
            id: "timeout";
            details: {
              duration: number;
            };
          },
        ];
      },
      {
        id: "api";
        items: [
          {
            id: "bad-request";
            details: {
              parameters?: any;
            };
          },
          {
            id: "unauthorized";
            details: {
              requiredTokenType?: string;
            };
          },
          {
            id: "forbidden";
            details: {
              requiredRole: string;
            };
          },
          {
            id: "not-found";
            details: {
              resource?: string;
            };
          },
          {
            id: "method-not-allowed";
            details: {
              attemptedMethod: string;
              allowedMethods: string[];
            };
          },
          {
            id: "conflict";
            details: {
              conflictDetails?: string;
            };
          },
          {
            id: "unprocessable-entity";
            details: {
              validationErrors: Record<string, string[]>;
            };
          },
          {
            id: "too-many-requests";
            details: {
              retryAfter: number;
            };
          },
          {
            id: "internal-server-error";
            details: {
              requestId?: string;
            };
          },
          {
            id: "service-unavailable";
            details: {
              retryAfter?: number;
            };
          },
          {
            id: "gateway-timeout";
            details: {
              duration: number;
            };
          },
          {
            id: "invalid-response";
            details: {
              data?: any;
            };
          },
          {
            id: "unknown-error";
            details?: {
              data?: any;
            };
          },
        ];
      },
      {
        id: "validation";
        details: {
          data?: any;
        };
        items: [
          {
            id: "missing-field";
            details: {
              fieldName: string;
            };
          },
          {
            id: "invalid-format";
            details: {
              fieldName: string;
              expectedFormat: string;
            };
          },
          {
            id: "too-long";
            details: {
              fieldName: string;
              maxLength: number;
            };
          },
          {
            id: "not-found";
            details: {
              entity: string;
              context: any;
            };
          },
          {
            id: "invalid-config";
            details: {
              configKey: string;
              expectedType: string;
            };
          },
        ];
      },
      {
        id: "general";
        items: [
          {
            id: "unknown-error";
            details?: {
              message?: string;
            };
          },
          {
            id: "unhandled-exception";
            details?: {
              exceptionMessage: string;
            };
          },
          {
            id: "not-implemented";
            details: {
              feature: string; // Feature name or endpoint
              context?: string; // Optional additional details
            };
          },
        ];
      },
    ];
  };
}

type AppErrorType = ExtractRecursiveIds<AppErrorDefinitions, "details">;

type ExtractErrorDetails<P extends AppErrorType> = FindRecursivePropValue<
  AppErrorDefinitions[keyof AppErrorDefinitions],
  P,
  "details"
>;

type StatusCode = 200 | 400 | 401 | 403 | 404 | 500;

export const isAppError = (error: any): error is AppError<AppErrorType> =>
  error instanceof AppError;

export class AppError<T extends AppErrorType> extends Error {
  public errorType: T;
  public details?: ExtractErrorDetails<T>;
  public statusCode: StatusCode;

  constructor(
    errorType: T,
    data?: {
      message?: string;
      statusCode?: StatusCode;
      details?: ExtractErrorDetails<T>;
    },
  ) {
    const { message, statusCode, details } = data ?? {};
    super(message);

    this.errorType = errorType;
    this.statusCode = statusCode ?? 400;
    this.details = details;

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);

    this.name = this.constructor.name;

    if (
      "captureStackTrace" in Error &&
      typeof Error.captureStackTrace === "function"
    ) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
