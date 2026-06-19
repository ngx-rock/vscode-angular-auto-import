const fs = require('node:fs/promises');
const path = require('node:path');

const workspaceRoot = __dirname;
const angularBuild = require(path.join(
  workspaceRoot,
  'node_modules/@angular/build/src/builders/application/index.js'
));

const projectCache = new Map();

async function loadProjectMeta(projectName) {
  if (projectCache.has(projectName)) {
    return projectCache.get(projectName);
  }

  const candidates = [
    path.join(workspaceRoot, 'apps', projectName, 'project.json'),
    path.join(workspaceRoot, 'libs', projectName, 'project.json'),
    path.join(workspaceRoot, 'libs', 'moon', 'project.json'),
    path.join(workspaceRoot, 'libs', 'mars', projectName, 'project.json'),
    path.join(workspaceRoot, 'libs', 'jupiter', projectName, 'project.json'),
    path.join(workspaceRoot, 'libs', 'mercury', projectName, 'project.json'),
    path.join(workspaceRoot, 'libs', 'core', projectName, 'project.json'),
    path.join(workspaceRoot, 'libs', 'shop', projectName, 'project.json'),
    path.join(workspaceRoot, 'libs', 'shared', projectName, 'project.json'),
    path.join(workspaceRoot, 'libs', 'api', projectName, 'project.json'),
  ];

  for (const candidate of candidates) {
    try {
      const json = JSON.parse(await fs.readFile(candidate, 'utf8'));
      projectCache.set(projectName, json);
      return json;
    } catch {}
  }

  throw new Error(`No project.json for ${projectName}`);
}

async function main() {
  const project = await loadProjectMeta('angular-demo');
  const buildOptions = {
    ...project.targets.build.options,
    ...project.targets.build.configurations.production,
  };

  const logger = {
    info: (...args) => console.log('[info]', ...args),
    warn: (...args) => console.log('[warn]', ...args),
    error: (...args) => console.log('[error]', ...args),
    log: (...args) => console.log('[log]', ...args),
  };

  const context = {
    workspaceRoot,
    logger,
    target: { project: 'angular-demo', target: 'build', configuration: 'production' },
    getProjectMetadata: loadProjectMeta,
    addTeardown: () => () => {},
  };

  for await (const result of angularBuild.buildApplicationInternal(buildOptions, context)) {
    console.log('RESULT_KIND', result.kind);
    console.log('RESULT_ERRORS', result.errors?.length ?? null);
    if (result.errors?.length) {
      console.log(JSON.stringify(result.errors, null, 2));
    }
    if (result.warnings?.length) {
      console.log(JSON.stringify(result.warnings, null, 2));
    }
    if (result.logs?.length) {
      console.log(JSON.stringify(result.logs, null, 2));
    }
  }
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exit(1);
});
