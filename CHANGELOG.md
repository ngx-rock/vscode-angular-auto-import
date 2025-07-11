# Change Log

All notable changes to the "angular-auto-import" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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

