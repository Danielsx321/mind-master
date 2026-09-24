import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'node_modules', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: { window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly', performance: 'readonly', history: 'readonly', location: 'readonly', requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly', HTMLElement: 'readonly', HTMLButtonElement: 'readonly', HTMLInputElement: 'readonly', KeyboardEvent: 'readonly', Event: 'readonly', console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', AudioContext: 'readonly', OscillatorType: 'readonly', process: 'readonly' } },
  },
);
