import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/test/**/*.test.js',
  workspaceFolder: './src/test/fixtures/simple-project',
  mocha: {
    ui: 'bdd',
    timeout: 20000,
    color: true,
    reporter: 'spec'
  },
  coverage: {
    reporter: ['text', 'html', 'lcov'],
    exclude: [
      'out/test/**',
      'src/test/**'
    ]
  }
});