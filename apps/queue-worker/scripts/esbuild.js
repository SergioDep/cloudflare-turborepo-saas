import { baseBuild } from "@repo/esbuild-config/index";

await baseBuild({
  entryPoints: ["src/**/*", "*.d.ts"],
});
