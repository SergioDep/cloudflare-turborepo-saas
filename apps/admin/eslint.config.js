// @ts-ignore
import { nextOnPages } from "eslint-plugin-next-on-pages";
import tseslint from "typescript-eslint";

import baseConfig from "@repo/eslint-config/base";
import nextjsConfig from "@repo/eslint-config/nextjs";
import reactConfig from "@repo/eslint-config/react";

export default tseslint.config(
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  {
    plugins: {
      nextOnPages,
    },
    extends: [nextOnPages.configs.recommended],
  },
);
