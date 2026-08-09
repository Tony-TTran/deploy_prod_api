import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

// ESLint "flat config": an array of config objects applied in order,
// later entries override/merge with earlier ones for matching files.
export default [
  // Base rule set from @eslint/js — catches real bugs, not style:
  // undefined variables, unreachable code, unused vars, etc.
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest', // allow the newest JS syntax (e.g. top-level await)
      sourceType: 'module', // this project uses ES modules (import/export)
      globals: {
        // Node globals ESLint doesn't know about by default — without these,
        // the recommended rules would flag `process`/`console` as undefined.
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      // Runs Prettier as an ESLint rule so formatting issues surface as lint warnings.
      prettier: eslintPluginPrettier,
    },
    rules: {
      // "warn" (not "error") so formatting nits don't fail a build outright.
      'prettier/prettier': 'warn',
    },
  },

  // Must come last: disables any core ESLint stylistic rules that would
  // otherwise conflict with Prettier's own formatting decisions.
  eslintConfigPrettier,
];
