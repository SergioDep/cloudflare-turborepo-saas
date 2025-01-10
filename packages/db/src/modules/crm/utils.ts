import { sqliteTableCreator } from "drizzle-orm/sqlite-core";

export const crmTableCreator = sqliteTableCreator(
  (name) => `crm_${name.toLowerCase()}`,
);
