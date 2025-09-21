# Change Log

All notable changes to the "angular-auto-import" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.12.2]  - 2025-09-21

### Improved
- **Module Resolution**: Enhanced AngularIndexer with intelligent module mapping that includes export count tracking for better component-to-module association


## [1.12.1] - 2025-09-18

### Improved
- **Code Quality**: Reduced cognitive complexity in DiagnosticProvider by refactoring large methods into smaller, focused functions
- **Performance**: Enhanced Angular indexing with improved SelectorTrie removal logic and better element matching

## [1.12.0] - 2025-09-15

### Added
- **Fix All Command**: New command "Angular Auto Import: Fix all missing imports in current file" automatically imports all components, directives, and pipes that are used in the current file but not yet imported
- **Improved Angular Import Path Handling**: Optimized Angular import path handling in indexer for better performance 

## [1.11.2] - 2025-09-12

### Fixed
- **Critical indexing stability**: Fixed "forgotten node" errors that occurred during periodic project reindexing ([#15]) 

[#15]: https://github.com/<repo-owner>/<repo-name>/issues/15 

## [1.11.1] - 2025-09-12

### Fixed
- **Project path override behavior**: `projectPath` setting now correctly overrides workspace folders when specified ([#16])
- Previously, `projectPath` was ignored when workspace folders were open, making it impossible to force a specific project root (e.g., `src/` subdirectory) 

[#16]: https://github.com/<repo-owner>/<repo-name>/issues/16 

## [1.11.0] - 2025-09-12

### Added  
- Debounce mechanism for document updates to reduce unnecessary processing 
- Template caching for improved diagnostic performance

### Improved 
- Enhanced external module exports handling 

## [1.10.1] - 2025-08-31

### Added
- New command "Show Logs" to view extension logs in output channel or log files
- New command "Show Performance Metrics" with detailed memory usage and indexing statistics 

## [1.10.0] - 2025-08-31

### Removed
- Removed highlighting of diagnostics and autocomplete for non-standalone components. Extension now only provides diagnostics and autocomplete for standalone Angular components, directives, and pipes.
 
## [1.9.0] - 2025-08-30

### Added
- Comprehensive logging system with configurable levels (DEBUG, INFO, WARN, ERROR, FATAL) 
- Enhanced tsconfig parsing with robust error handling using `get-tsconfig` library

### Configuration
- `angular-auto-import.logging.enabled` - Enable/disable logging (default: true)
- `angular-auto-import.logging.level` - Set logging level (default: INFO)
- `angular-auto-import.logging.fileLoggingEnabled` - Enable file logging (default: false)
- `angular-auto-import.logging.outputFormat` - Log format: plain or json (default: plain)

## [1.8.0] - 2025-08-18

### Changed

- Removed file naming convention restrictions - all TypeScript files are now indexed regardless of suffix

## [1.7.0] - 2025-08-13
 
### Improved
- Completion suggestions now show shared selectors with element names for better disambiguation
- More intelligent attribute and structural directive context detection
- Better filter text handling for improved search accuracy 

## [1.6.2] - 2025-08-03

### Improved
- Semantic resolution of module exports for external libraries using TypeScript's `TypeChecker` for more accurate class name detection, especially when dealing with type aliases.

## [1.6.1] - 2025-08-02

### Fixed
- Fixed pipe expressions in Angular templates

## [1.6.0] - 2025-08-01

### Added
- Support for Angular control flow blocks in diagnostic analysis (@if, @switch, @for, @defer)
- Enhanced template parsing to handle complex Angular template structures including conditional branches and defer blocks

### Improved
- Diagnostic provider now processes all template branches including @if branches, @switch cases, @for empty blocks, and @defer loading/error/placeholder blocks
- More comprehensive template analysis for better import detection accuracy

## [1.5.0] - 2025-07-30

### Added
- Support for indexing components, directives, and pipes from local, non-standalone NgModules.

### Fixed
- A bug with the index cache that could cause stale data or incorrect suggestions.

## [1.4.0] - 2025-07-28

### Added
- **External library support** for Angular components, directives, and pipes from npm packages  

### Changed 
- Autocompletion now uses regex-only context detection for better performance
- Import path resolution prefers module paths over relative paths
- Enhanced diagnostic provider with improved error handling
 

## [1.3.0] - 2025-07-14

### Improved
- Enhanced selector matching logic for better diagnostic accuracy
- Improved CSS selector specificity handling - now captures all matched selectors and uses the most specific one
- Better pipe handling in template diagnostics
- Simplified quickfix provider logic for cleaner code maintenance

### Changed
- Quickfix provider now only handles diagnostics from "angular-auto-import" source for better separation of concerns
- Streamlined diagnostic handling workflow

## [1.2.0] - 2025-07-11

### Changed
- Rewrote selector parsing using `@angular/compiler` for dramatically improved accuracy.
- Major internal refactoring for better performance and future-proofing.
- Replaced project tooling with Biome.

### Added
- More intelligent autocompletion for various Angular template syntaxes.

### Fixed
- Reduced noisy or duplicate diagnostics.

## [1.1.1] - 2025-06-24

### Fixed
- Fixed document saving after applying import edits to prevent race conditions with other providers
- Improved diagnostics update timing to ensure proper synchronization

## [1.1.0] - 2025-06-18

### Added
- Implemented Trie data structure for improved autocompletion performance (O(N) to O(L) complexity)
- Added support for template reference variables detection and handling
- Added built-in Angular directives (NgForm, NgModelGroup, FormGroup, RouterLink, RouterLinkActive, RouterOutlet)
- Enhanced completion provider with better context filtering and text replacement
- Improved quickfix provider with alternative selector generation and better import path resolution

### Changed
- Updated TypeScript path alias resolution to always prefer aliases over relative paths for cleaner imports
- Enhanced diagnostic provider to handle template reference elements
- Improved element indexing with better file caching and Trie-based search optimization
- Refactored completion suggestions grouping by element type for better performance

### Fixed
- Fixed generic import suggestions when Angular diagnostics are present
- Improved handling of secondary entry points for external packages (e.g., @angular/material/form-field)

## [1.0.0] - 2025-06-17
 
- Initial release

