export default {
  root: true,
  env: {
    es6: true,
    node: true,
    commonjs: true, // 允許 CommonJS 語法，但強烈建議統一使用 ES 模組
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module", // 確保使用 ES 模組
  },
  ignorePatterns: [
    "/lib/**/*", // 忽略編譯後的文件
    "/generated/**/*", // 忽略自動生成的文件
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    quotes: ["error", "double"],
    "import/no-unresolved": 0,
    indent: ["error", 2],
    "no-undef": "off", // 針對模組問題的臨時解決方案
  },
};
