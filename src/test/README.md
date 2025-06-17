# Angular Auto Import - Test Suite

This directory contains comprehensive tests for the Angular Auto Import VS Code extension.

## Test Structure

```
src/test/
├── fixtures/           # Test fixtures and mock projects
│   ├── simple-project/     # Basic Angular project with standard tsconfig
│   ├── complex-project/    # Complex project with multiple path aliases
│   ├── nx-project/         # Nx monorepo-style project
│   └── no-tsconfig-project/ # Project without tsconfig.json
├── suite/              # Test suites
│   ├── index.ts           # Test runner configuration
│   ├── tsconfig-helper.test.ts    # TSConfig Helper tests
│   ├── angular-indexer.test.ts    # Angular Indexer tests
│   └── utils.test.ts              # Utility functions tests
├── runTest.ts          # VS Code test runner
└── README.md           # This file
```

## Test Coverage

### 1. TSConfig Helper Tests (`tsconfig-helper.test.ts`)

Tests the `TsConfigHelper` service that handles TypeScript configuration parsing and path alias resolution:

- **Configuration Parsing**:

  - Standard `tsconfig.json` files
  - Nx-style `tsconfig.base.json` files
  - Complex configurations with multiple path mappings
  - Projects without tsconfig files
  - Malformed configuration files

- **Path Resolution**:

  - Alias resolution (`@app/*`, `@shared/*`, etc.)
  - Barrel imports (`@core`)
  - Relative path fallbacks
  - Cross-directory imports
  - Edge cases and error handling

- **Caching**:
  - Configuration caching
  - Path resolution trie caching
  - Cache invalidation

### 2. Angular Indexer Tests (`angular-indexer.test.ts`)

Tests the `AngularIndexer` service that indexes Angular components, directives, and pipes:

- **File Indexing**:

  - Component detection and parsing
  - Directive detection and parsing
  - Pipe detection and parsing
  - Multiple selector handling

- **Index Management**:

  - Full project indexing
  - Incremental updates
  - Element retrieval
  - Selector enumeration

- **File Watching**:

  - File watcher initialization
  - Change detection
  - Resource cleanup

- **Caching**:
  - Workspace state persistence
  - Cache loading and saving
  - Cache invalidation

### 3. QuickFix Provider Tests (`quickfix.test.ts`)

Tests the `QuickfixImportProvider` that provides code actions for Angular auto-import, following VS Code extension testing best practices from Context7:

- **Code Action Generation**:

  - Component import quick fixes
  - Directive import quick fixes
  - Pipe import quick fixes
  - Angular standard element handling
  - Module import handling

- **Diagnostic Processing**:

  - Angular Language Service error codes (NG8001, NG6004, etc.)
  - Custom diagnostic codes
  - Message pattern matching with regex
  - Selector extraction from various diagnostic formats

- **Action Management**:

  - Deduplication of identical actions
  - Sorting by preference (Angular vs custom)
  - Action validation and well-formedness
  - Command generation with proper arguments

- **Advanced Pattern Matching**:

  - Structural directive patterns (*ngFor, *ngIf)
  - Attribute directive patterns ([attr], routerLink, ngModel)
  - Pipe patterns in interpolation ({{ value | pipe }})
  - Complex selector patterns with attributes

- **Error Recovery and Resilience**:

  - Corrupted indexer handling
  - Empty selector extraction
  - Mixed valid/invalid diagnostics
  - Graceful degradation under failure conditions

- **Error Handling**:

  - Malformed diagnostics graceful handling
  - Indexer errors and corruption scenarios
  - Document read errors
  - Cancellation token support

- **Performance & Scalability**:

  - Large number of diagnostics (100+ test)
  - Long diagnostic messages
  - Unicode and special characters
  - Memory pressure handling
  - Efficient batch processing

- **Context7-Enhanced Testing Patterns**:
  - VS Code extension testing best practices
  - Async operation handling with proper error boundaries
  - Error context and meaningful logging
  - Workspace-specific configurations
  - Theming and accessibility compliance
  - Resource cleanup and disposal patterns
  - Integration with VS Code APIs (commands, diagnostics, etc.)

### 4. Utility Functions Tests (`utils.test.ts`)

Tests utility functions used throughout the extension:

- **Angular Element Extraction**:

  - Component metadata extraction
  - Directive metadata extraction
  - Pipe metadata extraction
  - Multiple selector parsing
  - Error handling for malformed code

- **File Type Detection**:

  - Angular file identification
  - File extension validation
  - Path pattern matching

- **String Processing**:

  - Selector normalization
  - Import statement generation
  - Relative path resolution

- **Edge Cases**:
  - Null/undefined input handling
  - Long input handling
  - Unicode and special character support

## Test Fixtures

### Simple Project

- Basic Angular project structure
- Standard `tsconfig.json` with common path aliases
- Sample component, directive, and pipe files

### Complex Project

- Advanced `tsconfig.json` with multiple path mappings
- Nested directory structure
- Complex alias patterns (`@/*`, `@lib/*`, `~/*`)

### Nx Project

- Monorepo-style configuration
- `tsconfig.base.json` with library mappings
- Scoped package aliases (`@myorg/*`)

### No TSConfig Project

- Project without TypeScript configuration
- Used for testing fallback behavior

## Running Tests

### Prerequisites

Install dependencies:

```bash
pnpm install
```

### Run All Tests

```bash
pnpm test
```

This will:

1. Compile TypeScript test files
2. Compile the main extension
3. Run linting
4. Execute tests in VS Code environment

### Run Tests in Watch Mode

```bash
pnpm run watch-tests
```

### Run Individual Test Suites

You can run individual test files using Mocha directly:

```bash
# Run only TSConfig Helper tests
npx mocha out/test/suite/tsconfig-helper.test.js

# Run only Angular Indexer tests
npx mocha out/test/suite/angular-indexer.test.js

# Run only Utility tests
npx mocha out/test/suite/utils.test.js
```

## Test Configuration

### Mocha Configuration

- **UI**: BDD (Behavior Driven Development)
- **Timeout**: 10-20 seconds for file operations
- **Reporter**: Spec (detailed output)
- **Color**: Enabled for better readability

### VS Code Test Configuration

- **Extension Development Path**: Project root
- **Extension Tests Path**: `src/test/suite/index`
- **Launch Args**: `--disable-extensions` (isolate testing environment)

## Writing New Tests

### Test File Structure

```typescript
import * as assert from "assert";
import { ServiceToTest } from "../../services/service-to-test";

describe("ServiceToTest", function () {
  // Set timeout for async operations
  this.timeout(10000);

  let service: ServiceToTest;

  beforeEach(function () {
    service = new ServiceToTest();
  });

  afterEach(function () {
    // Clean up resources
    if (service && service.dispose) {
      service.dispose();
    }
  });

  describe("#methodToTest", function () {
    it("should do something correctly", function () {
      const result = service.methodToTest("input");
      assert.strictEqual(result, "expected", "Should return expected value");
    });

    it("should handle edge cases", async function () {
      const result = await service.asyncMethod();
      assert.ok(result, "Should return truthy value");
    });
  });
});
```

### Best Practices

1. **Use descriptive test names**: Clearly describe what the test is verifying
2. **Group related tests**: Use nested `describe` blocks for organization
3. **Set appropriate timeouts**: File operations may need longer timeouts
4. **Clean up resources**: Always dispose of services and clean up files
5. **Test edge cases**: Include tests for null/undefined inputs, empty arrays, etc.
6. **Use fixtures**: Create reusable test data in the fixtures directory
7. **Mock external dependencies**: Use VS Code's mock context for testing

### Adding Test Fixtures

1. Create a new directory under `src/test/fixtures/`
2. Add necessary files (tsconfig.json, Angular files, etc.)
3. Document the fixture purpose in this README
4. Use the fixture in your tests by referencing its path

## Debugging Tests

### VS Code Debugging

1. Open the project in VS Code
2. Set breakpoints in test files
3. Run "Extension Tests" debug configuration
4. Tests will pause at breakpoints for inspection

### Console Output

Use `console.log()` in tests for debugging:

```typescript
it("should debug something", function () {
  const result = service.method();
  console.log("Debug result:", result);
  assert.ok(result);
});
```

### Test Isolation

Each test should be independent and not rely on the state from other tests. Use `beforeEach` and `afterEach` hooks to ensure clean state.

## Continuous Integration

Tests are designed to run in CI environments:

- No external dependencies required
- Self-contained fixtures
- Proper cleanup of temporary files
- Deterministic behavior

## Coverage

The test suite aims for high code coverage across:

- Core services (AngularIndexer, TsConfigHelper)
- Utility functions
- Error handling paths
- Edge cases and boundary conditions

Use the coverage reports generated by the test runner to identify areas needing additional tests.
