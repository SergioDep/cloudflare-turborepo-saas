import type { DbTablesSchema } from "@repo/db/types";

const schemaConfigs: DbTablesSchema = {} as DbTablesSchema;

/**
 * Registers a schema module to the schema registry.
 * @param schemas The schema object or function defining the structure of the database.
 */
export function registerDbSchema<S extends keyof DbTablesSchema>(
  schemas: Record<S, DbTablesSchema[S]>,
) {
  for (const [name, schema] of Object.entries<DbTablesSchema[S]>(schemas)) {
    schemaConfigs[name as S] = schema;
  }
}

/**
 * Retrieves all registered schemas.
 */
export function getRegisteredDbSchemas(): DbTablesSchema {
  return schemaConfigs;
}
