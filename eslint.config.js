// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Deno runtime (Supabase Edge Functions) — different module resolution
    // and globals than the Expo app; linted/type-checked by Deno's own
    // toolchain instead, not this project's ESLint/tsc.
    ignores: ['dist/*', 'supabase/functions/**'],
  },
]);
