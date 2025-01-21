import js from "@eslint/js"
import ts from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin"
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";

export default ts.config(
  {
    ignores: ["**/dist/**"],
  },
  js.configs.recommended,
  ts.configs.recommended,
  stylistic.configs['recommended-flat'],
  {
    plugins: {
      react,
      'react-hooks': hooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
    },
  },
)
