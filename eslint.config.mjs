import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ['dist/**', 'coverage/**'] },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
);
