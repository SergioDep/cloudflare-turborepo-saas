// @ts-ignore
import tseslint from "typescript-eslint";

import baseConfig from "@repo/eslint-config/base";
import reactConfig from "@repo/eslint-config/react";

export default tseslint.config(
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
);
