// @ts-check
import esbuild from "esbuild";

import globImportPlugin from "./plugins/import-glob-plugin.js";

/**
 * @type {esbuild.BuildOptions}
 */
const baseConfig = {
  entryPoints: ["src/**/*"],
  outdir: "dist",
  allowOverwrite: true,
  bundle: true,
  platform: "neutral",
  target: "esnext",
  minify: false,
  plugins: [globImportPlugin()],
};

/**
 * A build function that merges the base configuration with additional options.
 *
 * @param {esbuild.BuildOptions} args - Additional build options.
 * @returns {Promise<void>}
 */
export const baseBuild = async ({ ...args } = {}) => {
  try {
    await esbuild.build({ ...baseConfig, ...args });
  } catch (error) {
    process.exit(1);
  }
};
