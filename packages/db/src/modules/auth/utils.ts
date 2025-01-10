import { sqliteTableCreator } from "drizzle-orm/sqlite-core";

export const authTableCreator = sqliteTableCreator(
  (name) => `auth_${name.toLowerCase()}`,
);
