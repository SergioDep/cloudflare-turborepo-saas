import type { BatchItem } from "drizzle-orm/batch";
import type {
  SQLiteTableWithColumns,
  TableConfig,
} from "drizzle-orm/sqlite-core";
import { integer } from "drizzle-orm/sqlite-core";

// Returns a table select that omits specified keys from the given table configuration object.
export const omitKeys = <T extends TableConfig, K extends keyof T["columns"]>(
  obj: SQLiteTableWithColumns<T>,
  keys: K[] | readonly K[],
) => {
  const newObj = { ...obj };
  for (const key of keys) {
    delete newObj[key];
  }
  return newObj;
};

// TODO: Improve this
export const baseColumns = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
} as const;
