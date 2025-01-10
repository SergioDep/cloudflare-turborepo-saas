// Import all modules dynamically
import "glob:@repo/db/modules/**/*.ts";

import type { BatchItem } from "drizzle-orm/batch";
import { drizzle } from "drizzle-orm/d1";

import type { DbTablesSchema } from "@repo/db/types";
import { baseColumns } from "@repo/db/modules/base/utils";
import { getRegisteredDbSchemas } from "@repo/db/schemaRegistry";
import { AppError } from "@repo/validators/modules/base/app-error";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const isCI = !!process.env.CI;
// eslint-disable-next-line turbo/no-undeclared-env-vars
const isNextExportWorker = !!process.env.NEXT_IS_EXPORT_WORKER;
const defaultDB = process.env.DATABASE;

const needsInjection = !defaultDB && !isCI && !isNextExportWorker;

type DbTSchema<T = DbTablesSchema> = {
  [K in keyof T]: T[K];
};
type DbTClient = Exclude<typeof process.env.DATABASE, undefined>;

type DrizzleClient = ReturnType<typeof drizzle<DbTSchema, DbTClient>>;

class DbSingleton {
  private static _instance: DrizzleClient | undefined = undefined;
  private static _database: DbTClient | undefined = undefined;

  private static _initialize(database: DbTClient) {
    return drizzle(database, {
      logger: process.env.NODE_ENV === "development",
      schema: { ...getRegisteredDbSchemas() },
    });
  }

  static inject(database: DbTClient) {
    DbSingleton._database = database;
  }

  static get db(): DrizzleClient {
    if (!DbSingleton._instance) {
      DbSingleton._database =
        DbSingleton._database ??
        defaultDB ??
        (isCI ? "Error: process.env.CI is true." : undefined);

      if (!DbSingleton._database) {
        throw new AppError("base.database", {
          message: "DATABASE is not set.",
        });
      }

      DbSingleton._instance = DbSingleton._initialize(DbSingleton._database);
    }
    return DbSingleton._instance;
  }
}

export function injectDrizzleDbEnv(database: DbTClient) {
  DbSingleton.inject(database);
}

// Use proxy so I don't get errors
export const db = needsInjection
  ? new Proxy({} as DrizzleClient, {
      get(_, prop: keyof typeof DbSingleton.db) {
        const instance = DbSingleton.db;
        return instance[prop];
      },
    })
  : DbSingleton.db;

// Cloudflare supports max 100 parameters in a query
const D1_MAX_PARAMETERS = 100 - 1;

export const dbAutoBatch = async <
  T extends Record<string, unknown> | string | number,
  U extends BatchItem<"sqlite">,
>(
  {
    items,
    otherParametersCount = 0,
  }: {
    items: T[];
    otherParametersCount?: number;
  },
  cb: (chunk: T[]) => U,
) => {
  const chunks: T[][] = [];

  let chunk: T[] = [];
  let chunkParameters = 0;

  if (otherParametersCount > D1_MAX_PARAMETERS) {
    throw new Error(
      `otherParametersCount cannot be more than ${D1_MAX_PARAMETERS}`,
    );
  }

  for (const item of items) {
    const itemParameters =
      typeof item === "object"
        ? Object.keys(item).length + Object.keys(baseColumns).length + 1 // id
        : 1;

    if (itemParameters > D1_MAX_PARAMETERS) {
      throw new Error(`Item has too many parameters (${itemParameters})`);
    }

    if (
      chunkParameters + itemParameters + otherParametersCount >
      D1_MAX_PARAMETERS
    ) {
      if (chunk.length === 0) {
        // Item itself exceeds the limit, cannot process
        throw new Error(
          `Cannot process item with parameters exceeding limit (${itemParameters} >= ${D1_MAX_PARAMETERS})`,
        );
      }

      chunks.push(chunk);
      chunk = [item];
      chunkParameters = itemParameters;
    } else {
      chunk.push(item);
      chunkParameters += itemParameters;
    }
  }

  if (chunk.length) {
    chunks.push(chunk);
  }

  const results = await db.batch<U, readonly [U, ...U[]]>(
    chunks.map(cb) as unknown as readonly [U, ...U[]],
  );

  return results.flat();
};
