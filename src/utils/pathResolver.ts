import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Resolve file paths using {lang} placeholder
 * Example: "src/locales/{lang}.json" -> ["src/locales/ko.json", "src/locales/en.json", ...]
 */
export function resolveFilePaths(
  pattern: string,
  languages: string[],
): Map<string, string> {
  const pathMap = new Map<string, string>();

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (!workspaceRoot) {
    throw new Error('No workspace folder is open');
  }

  for (const lang of languages) {
    const filePath = pattern.replace('{lang}', lang);
    const fullPath = path.join(workspaceRoot, filePath);
    pathMap.set(lang, fullPath);
  }

  return pathMap;
}

/**
 * Get relative path from workspace root
 */
export function getRelativePath(absolutePath: string): string {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (!workspaceRoot) {
    return absolutePath;
  }
  return path.relative(workspaceRoot, absolutePath);
}
