import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Existing Store runtimes synchronize browser/media/route state in
      // effects. Keep the debt visible during the Store refactor without
      // allowing it to block an otherwise valid production build.
      'react-hooks/set-state-in-effect': 'warn'
    }
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', '.aj-hotfix-backups/**', 'ms-*/**', 'Inspect/**', 'next-env.d.ts'])
]);

export default eslintConfig;
