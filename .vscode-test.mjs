import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from '@vscode/test-cli';

const projectsDir = './src/test/projects';

/** Discover test project versions that have node_modules installed. */
const versions = readdirSync(projectsDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name.startsWith('v'))
  .filter(d => existsSync(`${projectsDir}/${d.name}/node_modules`))
  .map(d => d.name)
  .sort();

const e2eTests = versions.map(version => ({
  label: `e2e:${version}`,
  files: 'out/test/e2e/suite/**/*.test.js',
  workspaceFolder: `${projectsDir}/${version}`,
  mocha: {
    ui: 'bdd',
    timeout: 120000,
    color: true,
    reporter: 'spec',
  },
}));

const generateTests = versions.map(version => ({
  label: `generate:${version}`,
  files: 'out/test/e2e/generator/**/*.test.js',
  workspaceFolder: `${projectsDir}/${version}`,
  mocha: {
    ui: 'bdd',
    timeout: 120000,
    color: true,
    reporter: 'spec',
  },
}));

export default defineConfig({
  tests: [
    {
      label: 'unit',
      files: 'out/test/suite/**/*.test.js',
      workspaceFolder: './src/test/fixtures/simple-project',
      mocha: {
        ui: 'bdd',
        timeout: 20000,
        color: true,
        reporter: 'spec',
      },
    },
    ...e2eTests,
    ...generateTests,
    // Legacy aliases pointing to v19 (default version)
    {
      label: 'e2e',
      files: 'out/test/e2e/suite/**/*.test.js',
      workspaceFolder: `${projectsDir}/v19`,
      mocha: {
        ui: 'bdd',
        timeout: 120000,
        color: true,
        reporter: 'spec',
      },
    },
    {
      label: 'generate',
      files: 'out/test/e2e/generator/**/*.test.js',
      workspaceFolder: `${projectsDir}/v19`,
      mocha: {
        ui: 'bdd',
        timeout: 120000,
        color: true,
        reporter: 'spec',
      },
    },
  ],
  coverage: {
    reporter: ['text', 'html', 'lcov'],
    exclude: [
      'out/test/**',
      'src/test/**',
    ],
  },
});
