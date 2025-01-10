import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

function getLocalD1DB() {
  try {
    const basePath = path.resolve("../../.wrangler");
    const dbFile = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .find((f) => f.endsWith(".sqlite"));

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);

    // :(
    if (process.platform === "win32") {
      return `file:${url.replace(/\\/g, "/")}`;
    }

    return url;
  } catch (err) {
    console.log(`Error  ${err}`);
  }
}

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/modules/**/schema/**/*.ts",
  tablesFilter: ["!*_cf_*"],
  out: "./migrations",
  ...(process.env.NODE_ENV === "production"
    ? {
        driver: "d1-http",
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID,
          databaseId: process.env.DATABASE,
          token: process.env.CLOUDFLARE_D1_API_TOKEN,
        },
      }
    : {
        dbCredentials: {
          url: getLocalD1DB(),
        },
      }),
});
