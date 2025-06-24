/**
 * Утилиты для работы с путями файлов
 */
import * as path from "node:path";

/**
 * Нормализует путь, заменяя обратные слэши на прямые.
 */
export function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Заменяет или удаляет расширение файла.
 */
export function switchFileType(filePath: string, newExtensionWithDotOrEmpty: string): string {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseWithoutExt = path.basename(filePath, ext);

  if (newExtensionWithDotOrEmpty === "") {
    return path.join(dir, baseWithoutExt);
  } else {
    const finalExtension = newExtensionWithDotOrEmpty.startsWith(".")
      ? newExtensionWithDotOrEmpty
      : `.${newExtensionWithDotOrEmpty}`;
    return path.join(dir, `${baseWithoutExt}${finalExtension}`);
  }
}

/**
 * Вычисляет относительный путь от одного файла до другого.
 */
export function getRelativeFilePath(fromFileAbs: string, toFileAbsNoExt: string): string {
  const relative = path.relative(path.dirname(fromFileAbs), toFileAbsNoExt);
  const normalized = normalizePath(relative);
  return normalized.startsWith(".") ? normalized : `./${normalized}`;
}
