import tseslint from "typescript-eslint";

import baseConfig from "@repo/eslint-config/base";

export default tseslint.config(...baseConfig, {
  rules: {
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
});
