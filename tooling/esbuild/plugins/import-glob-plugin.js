import fs from "node:fs";
import path from "node:path";
import fastGlob from "fast-glob";

/** @typedef {import("esbuild").Plugin} Plugin */
/** @typedef {import("esbuild").OnLoadArgs} OnLoadArgs */
/** @typedef {import("esbuild").OnResolveArgs} OnResolveArgs */
/** @typedef {import("esbuild").TsconfigRaw} TsconfigRaw */

/**
 * A plugin for esbuild to handle glob imports.
 * @returns {Plugin} The esbuild plugin configuration.
 */
const globImportPlugin = () => {
  return {
    name: "glob-import",
    setup(build) {
      // Read and parse tsconfig.json
      const tsconfigPath = path.resolve(process.cwd(), "tsconfig.json");
      /** @type {TsconfigRaw} */
      let tsconfig = {};
      try {
        const tsconfigContents = fs.readFileSync(tsconfigPath, "utf8");
        tsconfig = JSON.parse(tsconfigContents);
      } catch (/** @type {any} */ err) {
        console.error(
          `Could not read tsconfig.json: ${err.message}. Using default configuration.`,
        );
        tsconfig = {};
      }

      const baseUrl = tsconfig.compilerOptions?.baseUrl
        ? path.resolve(process.cwd(), tsconfig.compilerOptions.baseUrl)
        : process.cwd();
      const paths = tsconfig?.compilerOptions?.paths ?? {};

      /**
       * Resolve alias to actual path based on tsconfig.json.
       * @param {string} importPath - The import path to resolve.
       * @returns {string} - The resolved path.
       */
      const resolveAlias = (importPath) => {
        for (const [aliasPattern, substitutions] of Object.entries(paths)) {
          const aliasRegex = new RegExp(
            "^" + aliasPattern.replace(/\*/g, "(.*)") + "$",
          );
          const match = importPath.match(aliasRegex);
          if (match) {
            const wildcardMatch = match[1] ?? "";
            for (const substitution of substitutions) {
              const resolved = substitution.replace("*", wildcardMatch);
              return path.resolve(baseUrl, resolved);
            }
          }
        }
        // If no alias matches, resolve relative to baseUrl
        return path.resolve(baseUrl, importPath);
      };

      build.onResolve({ filter: /^glob:/ }, async (args) => {
        const importPathWithGlob = args.path.slice("glob:".length);

        // Resolve the path alias (if any)
        const resolvedPath = resolveAlias(importPathWithGlob);

        return {
          path: "glob:" + resolvedPath,
          namespace: "glob-import",
          pluginData: {
            resolveDir: args.resolveDir,
            importer: args.importer,
            globPattern: resolvedPath,
          },
        };
      });

      build.onLoad(
        { filter: /^glob:/, namespace: "glob-import" },
        async (args) => {
          /** @type {{ resolveDir: string, globPattern: string }} */
          const { resolveDir, globPattern } = args.pluginData;

          // Use fastGlob to find matching files
          const files = await fastGlob(globPattern.replace(/\\/g, "/"), {
            cwd: baseUrl,
            absolute: true,
          });

          if (files.length === 0) {
            console.warn(`No files matched glob pattern: ${globPattern}`);
          }

          // Generate import statements
          const imports = files.map((file) => {
            const importPath = path
              .relative(resolveDir, file)
              .split(path.sep)
              .join("/")
              .replace(/\.(ts|js)x?$/, ""); // Remove .ts, .tsx, .js, .jsx extensions

            // Ensure relative paths start with './' or '../'
            const prefixedImportPath = importPath.startsWith(".")
              ? importPath
              : `./${importPath}`;
            return `import '${prefixedImportPath}';`;
          });

          const contents = imports.join("\n");

          return {
            contents,
            resolveDir,
            loader: "js",
          };
        },
      );
    },
  };
};

export default globImportPlugin;
