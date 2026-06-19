import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// ── Types ────────────────────────────────────────────────────────────────────

interface AppConfig {
  name: string;
  dependencies?: Record<string, string>;
}

interface VersionConfig {
  version: string;
  angularVersion: string;
  nxVersion: string;
  apps: AppConfig[];
}

// ── Config ───────────────────────────────────────────────────────────────────

const VERSIONS: VersionConfig[] = [
  {
    version: "v18",
    angularVersion: "~18.2.0",
    nxVersion: "20.3.0",
    apps: [
      { name: "angular-demo" },
      {
        name: "angular-material-demo",
        dependencies: { "@angular/cdk": "^18", "@angular/material": "^18" },
      },
      {
        name: "ng-zorro-demo",
        dependencies: { "ng-zorro-antd": "^18", "@ant-design/icons-angular": "^18" },
      },
      {
        name: "primeng-demo",
        dependencies: { primeng: "^18", "@primeng/themes": "^18", primeicons: "^7" },
      },
    ],
  },
  {
    version: "v20",
    angularVersion: "~20.0.0",
    nxVersion: "21.1.3",
    apps: [
      { name: "angular-demo" },
      {
        name: "angular-material-demo",
        dependencies: { "@angular/cdk": "^20", "@angular/material": "^20" },
      },
      {
        name: "ng-zorro-demo",
        dependencies: { "ng-zorro-antd": "^20", "@ant-design/icons-angular": "^20" },
      },
      {
        name: "primeng-demo",
        dependencies: { primeng: "^20", "@primeng/themes": "^20", primeicons: "^7" },
      },
    ],
  },
  {
    version: "v21",
    angularVersion: "~21.0.0",
    nxVersion: "22.6.0",
    apps: [
      { name: "angular-demo" },
      {
        name: "angular-material-demo",
        dependencies: { "@angular/cdk": "^21", "@angular/material": "^21" },
      },
      {
        name: "ng-zorro-demo",
        dependencies: { "ng-zorro-antd": "^21", "@ant-design/icons-angular": "^21" },
      },
      {
        name: "primeng-demo",
        dependencies: { primeng: "^21", primeicons: "^7" },
      },
      {
        name: "taiga-demo",
        dependencies: {
          "@taiga-ui/cdk": "5.0.0-rc.4",
          "@taiga-ui/core": "5.0.0-rc.4",
          "@taiga-ui/kit": "5.0.0-rc.4",
          "@taiga-ui/layout": "5.0.0-rc.4",
          "@taiga-ui/icons": "5.0.0-rc.4",
          "@taiga-ui/i18n": "5.0.0-rc.4",
          "@taiga-ui/event-plugins": "^5.0.0",
        },
      },
    ],
  },
];

// ── Paths ────────────────────────────────────────────────────────────────────

const ROOT_DIR = resolve(__dirname, "..");
const PROJECTS_DIR = join(ROOT_DIR, "src", "e2e", "projects");
const V19_DIR = join(PROJECTS_DIR, "v19");

// ── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd: string, cwd: string, { tolerateFailure = false } = {}): void {
  console.log(`  $ ${cmd}`);
  try {
    execSync(cmd, { cwd, stdio: "inherit" });
  } catch (error) {
    if (tolerateFailure) {
      console.log("  (command exited with error, continuing...)");
    } else {
      throw error;
    }
  }
}

function collectDependencies(apps: AppConfig[]): Record<string, string> {
  const deps: Record<string, string> = {};
  for (const app of apps) {
    if (app.dependencies) {
      Object.assign(deps, app.dependencies);
    }
  }
  return deps;
}

function mergePathsIntoTsconfig(projectDir: string): void {
  const targetPath = join(projectDir, "tsconfig.base.json");
  const sourcePath = join(V19_DIR, "tsconfig.base.json");

  if (!existsSync(targetPath) || !existsSync(sourcePath)) {
    return;
  }

  const targetContent = readFileSync(targetPath, "utf-8");
  const sourceContent = readFileSync(sourcePath, "utf-8");

  const target = JSON.parse(targetContent);
  const source = JSON.parse(sourceContent);

  const sourcePaths = source.compilerOptions?.paths ?? {};
  if (!target.compilerOptions) {
    target.compilerOptions = {};
  }
  target.compilerOptions.paths = {
    ...target.compilerOptions.paths,
    ...sourcePaths,
  };

  writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`, "utf-8");
  console.log("  Merged tsconfig.base.json paths");
}

/** Remove any *-e2e directories that may have leaked through */
function removeE2eDirectories(projectDir: string): void {
  const appsDir = join(projectDir, "apps");
  if (!existsSync(appsDir)) {
    return;
  }
  for (const entry of readdirSync(appsDir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.endsWith("-e2e")) {
      const e2eDir = join(appsDir, entry.name);
      rmSync(e2eDir, { recursive: true, force: true });
      console.log(`  Removed apps/${entry.name}/`);
    }
  }

  // Also check root level
  for (const entry of readdirSync(projectDir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.endsWith("-e2e")) {
      const e2eDir = join(projectDir, entry.name);
      rmSync(e2eDir, { recursive: true, force: true });
      console.log(`  Removed ${entry.name}/`);
    }
  }
}

// ── Generator ────────────────────────────────────────────────────────────────

function generateVersion(config: VersionConfig): void {
  const projectDir = join(PROJECTS_DIR, config.version);

  if (existsSync(projectDir)) {
    console.log(`\n⏭ ${config.version} already exists, skipping`);
    return;
  }

  console.log(`\n--- Generating ${config.version} (Angular ${config.angularVersion}, Nx ${config.nxVersion}) ---`);

  // Step 1: Create Nx workspace
  // Tolerate failure because Nx may fail on `git add` when path is in .gitignore,
  // but the workspace is still created successfully.
  console.log("\n[1/7] Creating Nx workspace...");
  run(
    `npx --yes create-nx-workspace@${config.nxVersion} ${config.version} --preset=angular-monorepo --appName=angular-demo --style=css --nxCloud=skip --e2eTestRunner=none --unitTestRunner=none --skipGit --packageManager=pnpm --no-interactive`,
    PROJECTS_DIR,
    { tolerateFailure: true },
  );

  if (!existsSync(projectDir)) {
    throw new Error(`Workspace creation failed: ${projectDir} does not exist`);
  }

  // Step 2: Generate additional apps (NOT angular-demo — created by preset)
  const additionalApps = config.apps.filter((a) => a.name !== "angular-demo");
  if (additionalApps.length > 0) {
    console.log(`\n[2/7] Generating ${additionalApps.length} additional app(s)...`);
    for (const app of additionalApps) {
      run(
        `npx nx g @nx/angular:app --directory=apps/${app.name} --e2eTestRunner=none --skipTests --style=css --no-interactive`,
        projectDir,
      );
    }
  } else {
    console.log("\n[2/7] No additional apps needed");
  }

  // Step 3: Install UI library dependencies
  const allDeps = collectDependencies(config.apps);
  const depEntries = Object.entries(allDeps);
  if (depEntries.length > 0) {
    const depList = depEntries.map(([name, version]) => `${name}@${version}`).join(" ");
    console.log(`\n[3/7] Installing dependencies: ${depList}`);
    run(`pnpm add ${depList}`, projectDir);
  } else {
    console.log("\n[3/7] No additional dependencies needed");
  }

  // Step 4: Copy libs/ from v19
  const v19Libs = join(V19_DIR, "libs");
  if (existsSync(v19Libs)) {
    console.log("\n[4/7] Copying libs/ from v19...");
    cpSync(v19Libs, join(projectDir, "libs"), { recursive: true });
  } else {
    console.log("\n[4/7] No libs/ found in v19");
  }

  // Step 5: Copy app sources from v19
  console.log("\n[5/7] Copying app sources from v19...");
  for (const app of config.apps) {
    const srcFrom = join(V19_DIR, "apps", app.name, "src");
    const srcTo = join(projectDir, "apps", app.name, "src");

    if (existsSync(srcFrom)) {
      cpSync(srcFrom, srcTo, { recursive: true, force: true });
      console.log(`  Copied apps/${app.name}/src/`);
    } else {
      console.log(`  Warning: apps/${app.name}/src/ not found in v19, skipping`);
    }
  }

  // Step 6: Merge tsconfig paths
  console.log("\n[6/7] Merging tsconfig paths...");
  mergePathsIntoTsconfig(projectDir);

  // Step 7: Clean up
  console.log("\n[7/7] Cleaning up...");
  removeE2eDirectories(projectDir);

  const gitDir = join(projectDir, ".git");
  if (existsSync(gitDir)) {
    rmSync(gitDir, { recursive: true, force: true });
    console.log("  Removed .git/ directory");
  }

  // Final: Run pnpm install to resolve everything
  console.log("\nRunning pnpm install...");
  run("pnpm install --no-frozen-lockfile", projectDir);

  console.log(`\nDone: ${config.version}`);
}

// ── CLI ──────────────────────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);
  const versionIdx = args.indexOf("--version");
  const requestedVersion = versionIdx !== -1 ? args[versionIdx + 1] : undefined;

  if (!existsSync(V19_DIR)) {
    console.error("Error: v19 project not found at", V19_DIR);
    process.exit(1);
  }

  mkdirSync(PROJECTS_DIR, { recursive: true });

  const versionsToGenerate = requestedVersion
    ? VERSIONS.filter((v) => v.version === requestedVersion)
    : VERSIONS;

  if (versionsToGenerate.length === 0) {
    console.error(`Error: Unknown version "${requestedVersion}". Available: ${VERSIONS.map((v) => v.version).join(", ")}`);
    process.exit(1);
  }

  for (const config of versionsToGenerate) {
    generateVersion(config);
  }

  console.log("\nAll done!");
}

main();
