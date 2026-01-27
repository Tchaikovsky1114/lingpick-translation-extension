import * as fs from 'fs';
import * as path from 'path';

/**
 * Set nested value in object using dot notation
 * Example: setNestedValue(obj, 'feature.title', 'Title')
 */
function setNestedValue(obj: any, keyPath: string, value: string): void {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Load JSON file, creating if it doesn't exist
 */
function loadJsonFile(filePath: string): any {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error loading JSON file ${filePath}:`, error);
  }
  return {};
}

/**
 * Save JSON file with 2-space indentation
 */
function saveJsonFile(filePath: string, data: any): void {
  const dir = path.dirname(filePath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Check if key exists in JSON file
 */
export function keyExists(filePath: string, keyPath: string): boolean {
  const data = loadJsonFile(filePath);
  const keys = keyPath.split('.');
  let current = data;

  for (const key of keys) {
    if (!(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
}

/**
 * Update translation files with new translations
 */
export function updateTranslationFiles(
  filePaths: Map<string, string>,
  keyPath: string,
  translations: Map<string, string>,
): void {
  for (const [lang, filePath] of filePaths) {
    const translation = translations.get(lang);
    if (!translation) {
      continue;
    }

    const data = loadJsonFile(filePath);
    setNestedValue(data, keyPath, translation);
    saveJsonFile(filePath, data);
  }
}

/**
 * Get list of updated file paths
 */
export function getUpdatedFilePaths(
  filePaths: Map<string, string>,
  translations: Map<string, string>,
): string[] {
  const updated: string[] = [];

  for (const [lang, filePath] of filePaths) {
    if (translations.has(lang)) {
      updated.push(filePath);
    }
  }

  return updated;
}
