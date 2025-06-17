# Change Log

All notable changes to the "angular-auto-import" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2025-06-17
 
- Initial release

## [1.1.0] - 2025-06-18

### Added
- Implemented Trie data structure for improved autocompletion performance (O(N) to O(L) complexity).

### Fixed
- Resolved autocompletion bug where typed text was duplicated (e.g., `<lib-lib-ui-demo-one>`).
- Fixed `QuickfixImportProvider` test failures related to diagnostic updates.
- Corrected `AngularIndexer.getElement` to handle invalid selectors gracefully.

### Changed
- Refactored `AngularIndexer` to use `SelectorTrie` for element storage.
- Updated unit tests for `AngularIndexer` and `QuickfixImportProvider` for reliability.
