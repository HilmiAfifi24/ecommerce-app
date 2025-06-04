// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextJsConfigs = compat.extends(
  "next/core-web-vitals",
  "next/typescript"
);

const eslintConfig = [
  ...nextJsConfigs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
];

export default eslintConfig;