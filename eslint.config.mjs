import js from '@eslint/js'
import ts from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'

export default ts.config(
  {
    ignores: ['**/dist/**', 'backend/**'],
  },
  js.configs.recommended,
  ts.configs.recommended,
  stylistic.configs['recommended-flat'],
  {
    rules: {
      'no-empty': ['error', {
        allowEmptyCatch: true,
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@stylistic/max-statements-per-line': 'off',
    },
  },
  {
    plugins: {
      react,
      'react-hooks': hooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
)
