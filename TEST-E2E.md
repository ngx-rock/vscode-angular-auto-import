# E2E Snapshot-Based Regression Tests

End-to-end tests that verify diagnostics (missing Angular imports) and quickfixes (auto-import suggestions) work correctly inside a real VS Code Extension Dev Host against multiple Angular version test projects (v18, v19, v20, v21).

## How It Works

1. **Generator** strips `imports: [...]` from a component, opens the template in VS Code, collects all diagnostics and quickfixes produced by the extension, and saves them as a `descriptor.json` snapshot.
2. **Regression runner** repeats the same strip-and-open flow, then asserts that every diagnostic and quickfix matches the snapshot exactly — code, severity, line/character positions, quickfix titles and commands.
3. **Quickfix execution** applies each quickfix via `vscode.commands.executeCommand`, then reads the component file and verifies that both the TypeScript `import` statement and `@Component({ imports: [...] })` entry were added correctly.

```
src/test/e2e/
  helpers/
    diagnostics-helper.ts   # waitForDiagnosticsToStabilize, collectQuickFixes
    file-helper.ts          # stripAngularImports, replaceFileContent, waitForExtensionActivation
  suite/
    diagnostics-regression.test.ts   # Universal regression runner
  generator/
    generate-descriptor.test.ts      # Descriptor generator
  cases/
    control-flow/
      descriptor.json                # Generated snapshot (committed to git)
```

## Multi-Version Test Projects

Tests run against Nx workspaces in `src/test/projects/v{18,19,20,21}`. Each workspace contains Angular demo apps with different UI library combinations:

| Version | Angular | Nx     | Apps                                                              |
|---------|---------|--------|-------------------------------------------------------------------|
| v18     | ~18.2   | 20.3.0 | angular-demo, angular-material, ng-zorro, primeng                 |
| v19     | ~19.2   | 21.1.3 | angular-demo, angular-material, ng-zorro, primeng, taiga (v4)     |
| v20     | ~20.0   | 21.1.3 | angular-demo, angular-material, ng-zorro, primeng                 |
| v21     | ~21.0   | 22.6.0 | angular-demo, angular-material, ng-zorro, primeng, taiga (v5-rc)  |

- **v19** is the reference project, checked into git. All other versions are generated from it.
- **v18, v20, v21** are gitignored and generated on demand via the generator script.
- Test cases that reference apps missing in a given version are automatically skipped.

### Generating Test Projects

```bash
# Generate all missing versions (skips existing ones)
pnpm run generate:test-projects

# Generate a specific version
pnpm run generate:test-projects -- --version v21
```

The generator (`scripts/generate-test-projects.ts`):
1. Creates an Nx workspace with `create-nx-workspace`
2. Generates additional apps (`@nx/angular:app`)
3. Installs UI library dependencies
4. Copies `libs/` and `apps/*/src/` from v19
5. Merges `tsconfig.base.json` paths from v19

## Commands

```bash
# Run e2e regression tests against v19 (default)
pnpm run test:e2e

# Run e2e against a specific Angular version
pnpm run test:e2e:v18
pnpm run test:e2e:v19
pnpm run test:e2e:v20
pnpm run test:e2e:v21

# Regenerate descriptor snapshots (run after template or extension logic changes)
pnpm run test:generate

# Regenerate for a specific version
pnpm run test:generate:v19
pnpm run test:generate:v21

# Run only unit tests
pnpm run test:unit

# Run all tests (unit + e2e + generate)
pnpm run test
```

## Running Individual Cases

For targeted runs, do not use `pnpm run test:e2e -- --grep ...` or `pnpm run test:generate -- --grep ...`.
Those scripts also rebuild `out/` and copy fixtures, so the extra `--grep` is passed to the wrong command in the chain.

Use this flow instead:

```bash
# 1. Rebuild compiled tests
pnpm run compile-tests

# 2. Copy committed descriptor snapshots into out/
pnpm run copy-e2e-cases

# 3a. Run one regression case
pnpm exec vscode-test --label e2e --grep "Case: taiga"

# 3b. Run one generator case
pnpm exec vscode-test --label generate --grep "generate taiga"
```

Examples:

```bash
# One standalone regression case
pnpm exec vscode-test --label e2e --grep "Case: material-table"

# One legacy-modules regression case
pnpm exec vscode-test --label e2e --grep "Case: material-overview-legacy-modules"

# Regenerate exactly one descriptor snapshot
pnpm exec vscode-test --label generate --grep "generate material-table"
```

Notes:

- `e2e` matches the `describe("Case: ...")` title from `src/test/e2e/suite/diagnostics-regression.test.ts`
- `generate` matches the `it("generate ...")` title from `src/test/e2e/generator/generate-descriptor.test.ts`
- If you changed `src/test/e2e/cases/**/descriptor.json`, rerun `pnpm run copy-e2e-cases` before a targeted `e2e` run
- If VS Code says `Running extension tests from the command line is currently only supported if no other instance of Code is running`, close leftover `.vscode-test` instances and rerun

## Adding a New Test Case

### 1. Register the case in the generator

Open `src/test/e2e/generator/generate-descriptor.test.ts` and add an entry to the `CASES` array:

```typescript
const CASES: CaseConfig[] = [
  {
    name: "control-flow",
    componentPath: "apps/angular-demo/src/app/control-flow/control-flow.component.ts",
    templatePath: "apps/angular-demo/src/app/control-flow/control-flow.component.html",
  },
  // Add your new case here:
  {
    name: "standard",
    componentPath: "apps/angular-demo/src/app/standard/standard.component.ts",
    templatePath: "apps/angular-demo/src/app/standard/standard.component.html",
  },
];
```

### 2. Create the cases directory

```bash
mkdir -p src/test/e2e/cases/standard
```

### 3. Generate the descriptor

```bash
pnpm run test:generate
```

This will create `src/test/e2e/cases/standard/descriptor.json` with all diagnostics and quickfixes captured from the live extension.

### 4. Review and commit the descriptor

Inspect the generated JSON — it contains every diagnostic with exact positions and every quickfix with its title. Commit it to git.

### 5. Run the regression

```bash
pnpm run test:e2e
```

The runner auto-discovers all `cases/*/descriptor.json` files — no additional registration needed.

## Descriptor Format

```jsonc
{
  "case": "control-flow",
  "componentPath": "apps/angular-demo/src/app/control-flow/control-flow.component.ts",
  "templatePath": "apps/angular-demo/src/app/control-flow/control-flow.component.html",
  "diagnostics": [
    {
      "code": "missing-component-import:lib-ui-demo-one",
      "severity": "Warning",
      "source": "angular-auto-import",
      "startLine": 5,        // 0-based line number
      "startCharacter": 8,   // 0-based column
      "endLine": 5,
      "endCharacter": 25
    }
  ],
  "quickfixes": [
    {
      "diagnosticCode": "missing-component-import:lib-ui-demo-one",
      "title": "Import UiDemoOneComponent from '@angular-demo/ui-demo-one'",
      "command": "angular-auto-import.importElement",
      "expectedImport": {
        "className": "UiDemoOneComponent",
        "moduleSpecifier": "@angular-demo/ui-demo-one"
      }
    }
  ]
}
```

Each diagnostic is validated by its exact position in the template file (`startLine:startCharacter` to `endLine:endCharacter`), not just by count.

## When to Regenerate Descriptors

Run `pnpm run test:generate` after:

- Changing a template file used by a test case
- Changing diagnostic range calculation logic in the extension
- Adding/removing elements from a component's `imports` array
- Changing how the extension produces diagnostic codes or quickfix titles

## How `stripAngularImports` Works

The function parses the component source to:

1. Extract class names from the `imports: [Foo, Bar, ...]` array in `@Component`
2. Remove those names from TypeScript `import { ... } from '...'` statements (deletes the entire statement if it becomes empty)
3. Set `imports: []`
4. Keep non-template imports (`Component`, `inject`, `FormBuilder`, `Validators`, etc.)

No stripped files are committed — stripping happens on the fly during test execution, and the original file is always restored in the `after()` hook.

## Configuration

Test labels are defined in `.vscode-test.mjs` and generated dynamically by scanning `src/test/projects/v*` directories:

| Label            | Files                                 | Workspace                            | Timeout |
|------------------|---------------------------------------|--------------------------------------|---------|
| `unit`           | `out/test/suite/**/*.test.js`         | `./src/test/fixtures/simple-project` | 20s     |
| `e2e`            | `out/test/e2e/suite/**/*.test.js`     | `./src/test/projects/v19`            | 120s    |
| `e2e:v18`        | `out/test/e2e/suite/**/*.test.js`     | `./src/test/projects/v18`            | 120s    |
| `e2e:v19`        | `out/test/e2e/suite/**/*.test.js`     | `./src/test/projects/v19`            | 120s    |
| `e2e:v20`        | `out/test/e2e/suite/**/*.test.js`     | `./src/test/projects/v20`            | 120s    |
| `e2e:v21`        | `out/test/e2e/suite/**/*.test.js`     | `./src/test/projects/v21`            | 120s    |
| `generate`       | `out/test/e2e/generator/**/*.test.js` | `./src/test/projects/v19`            | 120s    |
| `generate:v18`   | `out/test/e2e/generator/**/*.test.js` | `./src/test/projects/v18`            | 120s    |
| `generate:v19`   | `out/test/e2e/generator/**/*.test.js` | `./src/test/projects/v19`            | 120s    |
| `generate:v20`   | `out/test/e2e/generator/**/*.test.js` | `./src/test/projects/v20`            | 120s    |
| `generate:v21`   | `out/test/e2e/generator/**/*.test.js` | `./src/test/projects/v21`            | 120s    |

Labels `e2e` and `generate` (without version suffix) are legacy aliases pointing to v19.

Only versions with `node_modules/` installed appear as labels. Generate the project first if a label is missing.

## Troubleshooting

**Tests time out waiting for diagnostics**
The extension needs time to activate and index the project. The default timeout is 120s. If your machine is slow, increase `timeoutMs` in `waitForDiagnosticsToStabilize()` and `waitForExtensionActivation()`.

**Descriptor is stale after template changes**
Regenerate it: `pnpm run test:generate`. The e2e runner compares exact positions, so any template edit will cause mismatches.

**`copy-e2e-cases` fails**
Ensure `src/test/e2e/cases/` exists. The `cp -r` command copies descriptor files to `out/test/e2e/` where the compiled tests expect them.

**Test version label not found (e.g. `e2e:v21`)**
The project hasn't been generated yet, or `node_modules/` is missing. Run:
```bash
pnpm run generate:test-projects -- --version v21
```

**`create-nx-workspace` fails with "paths are ignored by .gitignore"**
This is expected — generated projects are gitignored. The generator tolerates this error and continues. The workspace is still created successfully.

**Some test cases are skipped for a version**
This is by design. If an app (e.g. `taiga-demo`) doesn't exist in a given version, all its test cases are skipped automatically via `this.skip()` in the `before()` hook.
