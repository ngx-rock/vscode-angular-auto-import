/**
 * Утилиты для работы с `package.json` файлами.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * Информация о зависимостях Angular, найденных в `node_modules`.
 */
interface AngularDependency {
  name: string;
  path: string; // Реальный путь к папке библиотеки
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  exports?: Record<string, string | ExportTarget>;
  types?: string;
  typings?: string;
}

interface ExportTarget {
  types?: string;
}

/**
 * Находит и читает корневой `package.json` проекта.
 */
async function getRootPackageJson(projectRootPath: string): Promise<PackageJson | null> {
  const packageJsonPath = path.join(projectRootPath, "package.json");
  try {
    const content = await fs.readFile(packageJsonPath, "utf-8");
    return JSON.parse(content) as PackageJson;
  } catch (error) {
    console.error(`[PackageJson] Error reading or parsing root package.json at ${packageJsonPath}`, error);
    return null;
  }
}

/**
 * Находит все Angular-библиотеки в зависимостях проекта.
 * @param projectRootPath - Путь к корню проекта.
 * @returns Список Angular-библиотек.
 */
export async function findAngularDependencies(projectRootPath: string): Promise<AngularDependency[]> {
  const rootPackageJson = await getRootPackageJson(projectRootPath);
  if (!rootPackageJson) {
    return [];
  }

  const dependencies = {
    ...(rootPackageJson.dependencies ?? {}),
    ...(rootPackageJson.devDependencies ?? {}),
  };

  const angularDependencies: AngularDependency[] = [];
  const processedDeps = new Set<string>();

  for (const depName of Object.keys(dependencies)) {
    if (processedDeps.has(depName)) {
      continue;
    }
    processedDeps.add(depName);

    try {
      const depPath = path.join(projectRootPath, "node_modules", depName);
      const realDepPath = await fs.realpath(depPath); // xử lý symlinks cho pnpm
      const depPackageJsonPath = path.join(realDepPath, "package.json");
      const depPackageJsonContent = await fs.readFile(depPackageJsonPath, "utf-8");
      const depPackageJson = JSON.parse(depPackageJsonContent) as PackageJson;

      const isAngularLib =
        depPackageJson.peerDependencies?.["@angular/core"] ||
        depPackageJson.dependencies?.["@angular/core"] ||
        depName.startsWith("@angular/");

      if (isAngularLib) {
        angularDependencies.push({ name: depName, path: realDepPath });
      }
    } catch (_error) {
      // console.warn(`[PackageJson] Could not process dependency: ${depName}`, error);
    }
  }

  return angularDependencies;
}

/**
 * Получает точки входа для библиотеки из `package.json`.
 * @param library - Информация о библиотеке.
 * @returns Map, где ключ - путь импорта, а значение - абсолютный путь к `.d.ts` файлу.
 */
export async function getLibraryEntryPoints(library: AngularDependency): Promise<Map<string, string>> {
  const entryPoints = new Map<string, string>();
  try {
    const packageJsonPath = path.join(library.path, "package.json");
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent) as PackageJson;

    if (packageJson.exports) {
      // Обработка поля "exports"
      for (const [exportPath, target] of Object.entries(packageJson.exports)) {
        if (typeof target === "string" && target.endsWith(".d.ts")) {
          const importPath = path.join(library.name, exportPath).replace(/\\/g, "/");
          entryPoints.set(importPath, path.resolve(library.path, target));
        } else if (typeof target === "object" && target !== null && target.types) {
          const typesPath = target.types;
          if (typeof typesPath === "string" && typesPath.endsWith(".d.ts")) {
            const importPath = path.join(library.name, exportPath).replace(/\\/g, "/");
            entryPoints.set(importPath, path.resolve(library.path, typesPath));
          }
        }
      }
    } else if (packageJson.types || packageJson.typings) {
      // Фоллбэк на "types" или "typings"
      const typesFile = packageJson.types || packageJson.typings;
      if (typeof typesFile === "string" && typesFile.endsWith(".d.ts")) {
        entryPoints.set(library.name, path.resolve(library.path, typesFile));
      }
    }
  } catch (error) {
    console.error(`[PackageJson] Error getting entry points for ${library.name}`, error);
  }
  return entryPoints;
} 