import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'out/**',
      '.local/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  { languageOptions: { globals: globals.node } },
  {
    files: ['src/**/*.{ts,svelte}'],
    languageOptions: { globals: globals.browser },
    rules: { '@typescript-eslint/consistent-type-imports': 'error' },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ['src/domain/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'svelte',
            'svelte/*',
            'node:*',
            'electron',
            '**/ui/**',
            '**/infrastructure/**',
            '**/application/**',
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        'window',
        'document',
        'fetch',
        'localStorage',
        'sessionStorage',
        'Date',
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'Inject randomness into domain logic.',
        },
      ],
    },
  },
];
