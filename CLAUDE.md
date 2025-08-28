# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

**Package Manager**: Uses `pnpm` (specified via `packageManager` in package.json)

### Essential Commands
```bash
# Install dependencies
pnpm install

# Development build with watch mode
pnpm run watch

# Production build (for packaging)
pnpm run package

# Type checking only
pnpm run check-types

# Linting and formatting
pnpm run lint          # Full lint check (biome + knip + types)
pnpm run lint:fix      # Auto-fix biome issues
pnpm run format:fix    # Auto-format code
pnpm run check:fix     # Check and fix all issues

# Testing
pnpm run test          # Run VS Code extension tests
pnpm run pretest       # Compile tests and fixtures

# Publishing
pnpm run vsce:package  # Create .vsix package
pnpm run vsce:publish  # Publish to marketplace
```

### Key Build Scripts
- `compile`: Type check + lint + esbuild (development)
- `package`: Type check + lint + esbuild (production, minified)
- `watch`: Parallel watch for both esbuild and TypeScript

## Architecture Overview

This is a VS Code extension that provides automatic Angular imports and intelligent completions for Angular templates.

### Core Components

**Extension Entry Point** (`src/extension.ts`)
- Multi-project workspace support with automatic Angular project detection
- Project-specific indexer instances managed via Maps
- Periodic reindexing with configurable intervals
- Configuration-driven activation and cleanup

**Angular Indexer** (`src/services/indexer.ts`)
- Uses `ts-morph` for TypeScript AST parsing
- Trie-based selector storage for efficient prefix matching
- Supports both local project files and node_modules libraries
- Caches parsed data in VS Code workspace state
- File system watcher for incremental updates

**Provider Architecture** (`src/providers/`)
- `completion.ts`: IntelliSense for Angular selectors in templates
- `diagnostics.ts`: Highlights missing imports with configurable severity
- `quickfix.ts`: Code actions to auto-import Angular elements

**Type System** (`src/types/`)
- `AngularElementData`: Core data structure for components/directives/pipes
- `ProcessedTsConfig`: TypeScript configuration with path mappings
- `ProjectContext`: Project-specific context with indexer and config

### Data Flow

1. **Initialization**: Detects Angular projects, loads/creates indexers
2. **Indexing**: Parses `.component.ts`, `.directive.ts`, `.pipe.ts` files
3. **Completion**: Provides suggestions based on trie prefix matching
4. **Diagnostics**: Identifies unknown Angular elements in templates
5. **Quick Fixes**: Automatically adds imports and updates module declarations

### Key Design Patterns

- **Multi-project support**: Each workspace folder gets its own indexer
- **Incremental updates**: File watcher maintains index consistency
- **Fallback parsing**: Regex parsing when ts-morph fails
- **Module resolution**: Handles both standalone and NgModule-based components
- **Library indexing**: Supports external Angular libraries from node_modules

### Configuration

Settings are defined in `package.json` under `contributes.configuration`:
- `angular-auto-import.projectPath`: Override workspace folder detection
- `angular-auto-import.index.refreshInterval`: Periodic reindexing (minutes)
- `angular-auto-import.diagnostics.*`: Control diagnostic behavior

### Testing Framework

- Uses VS Code Extension Test Runner (`@vscode/test-cli`)
- Test fixtures in `src/test/fixtures/` for different project scenarios
- Mocha-based test suites in `src/test/suite/`

### Code Quality Tools

- **Biome**: Linting, formatting, and style enforcement
- **Knip**: Dead code elimination and dependency analysis  
- **TypeDoc**: API documentation generation
- **ESBuild**: Fast bundling with VS Code-specific optimizations