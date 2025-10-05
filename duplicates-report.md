Found a 5 line (92 tokens) duplication in the following files:
* Starting at line 582 of /Users/rock/Projects/vscode-angular-auto-import/src/commands/index.ts
* Starting at line 473 of /Users/rock/Projects/vscode-angular-auto-import/src/extension.ts

```
    commandContext.projectTsConfigs
  );

  if (!context) {
    logger.warn(`Document ${document.uri.fsPath} does not belong to any known workspace folder or project root`);
```

---

Found a 2 line (75 tokens) duplication in the following files:
* Starting at line 1025 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts
* Starting at line 1525 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts

```
        `Full index completed - Memory: ${Math.round(finalMemory.memoryUsage.heapUsed / 1024 / 1024)}MB (Δ${memoryDelta > 0 ? "+" : ""}${Math.round(memoryDelta / 1024 / 1024)}MB)`
      );
```

---

Found a 3 line (75 tokens) duplication in the following files:
* Starting at line 1137 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts
* Starting at line 1160 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts

```
        logger.info(`AngularIndexer (${path.basename(this.projectRootPath)}): No valid cache found in workspace.`);
        return false;
      }
```

---

Found a 3 line (65 tokens) duplication in the following files:
* Starting at line 330 of /Users/rock/Projects/vscode-angular-auto-import/src/providers/diagnostics.ts
* Starting at line 347 of /Users/rock/Projects/vscode-angular-auto-import/src/providers/diagnostics.ts

```
    const sourceFile = this.getSourceFile(tsDocument);
    if (!sourceFile) {
      logger.debug(`[DiagnosticProvider] Could not get source file for ${tsDocument.fileName}`);
```

---

Found a 1 line (54 tokens) duplication in the following files:
* Starting at line 534 of /Users/rock/Projects/vscode-angular-auto-import/src/commands/index.ts
* Starting at line 441 of /Users/rock/Projects/vscode-angular-auto-import/src/extension.ts

```
    logger.warn(`Cache keys not set for ${projectRootPath}, attempting to set them now`);
```

---

Found a 3 line (53 tokens) duplication in the following files:
* Starting at line 1603 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts
* Starting at line 1643 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts
* Starting at line 1659 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts

```
        this.collectClassesFromSourceFile(sourceFile, allLibraryClasses);
      } catch {
        logger.warn(`[Indexer] SourceFile node forgotten during class collection, skipping file`);
```

---

Found a 8 line (52 tokens) duplication in the following files:
* Starting at line 1984 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts
* Starting at line 2074 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts

```
    exportsTuple: import("ts-morph").TupleTypeNode,
    moduleName: string,
    importPath: string,
    componentToModuleMap: Map<string, { moduleName: string; importPath: string; exportCount: number }>,
    allLibraryClasses: Map<string, ClassDeclaration>,
    typeChecker: TypeChecker,
    moduleExports?: Set<string>
  ) {
```

---

Found a 3 line (51 tokens) duplication in the following files:
* Starting at line 624 of /Users/rock/Projects/vscode-angular-auto-import/src/providers/completion.ts
* Starting at line 634 of /Users/rock/Projects/vscode-angular-auto-import/src/providers/completion.ts

```
        `✅ Import standalone \`${element.name}\` (${element.type}) from \`${element.path}\`.\n\nSelector: \`${originalBestSelector}\``
      );
    } else if (element.exportingModuleName) {
```

---

Found a 2 line (51 tokens) duplication in the following files:
* Starting at line 1604 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts
* Starting at line 1697 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts

```
      } catch {
        logger.warn(`[Indexer] SourceFile node forgotten during class collection, skipping file`);
```

---

Found a 2 line (51 tokens) duplication in the following files:
* Starting at line 1644 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts
* Starting at line 1697 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts

```
      } catch {
        logger.warn(`[Indexer] SourceFile node forgotten during module mapping for ${importPath}, skipping`);
```

---

Found a 2 line (51 tokens) duplication in the following files:
* Starting at line 1660 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts
* Starting at line 1697 of /Users/rock/Projects/vscode-angular-auto-import/src/services/indexer.ts

```
      } catch {
        logger.warn(`[Indexer] SourceFile node forgotten during declarations indexing for ${importPath}, skipping`);
```
