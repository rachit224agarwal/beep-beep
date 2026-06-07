import eslint from '@eslint/js';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    ignores: ['node_modules/', 'sounds/'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
  {
    files: ['test/**'],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
