/**
 * Extract translation key from selected text
 * Pattern: t('key.name') or t("key.name") or just 'key.name'
 */
export function extractTranslationKey(text: string): string | null {
  // Try to extract from t() function first
  const keyPattern = /t\(['"](.+?)['"]\)/;
  const match = text.match(keyPattern);
  
  // If t() pattern is found, return the extracted key
  if (match) {
    return match[1];
  }
  
  // Otherwise, treat the text itself as the key
  return text.trim() || null;
}

/**
 * Validate key format
 * Valid: myFeature.title, settings.general.language
 * Invalid: empty, contains only dots, etc.
 */
export function isValidKeyFormat(key: string): boolean {
  // Key must contain at least one dot and no empty segments
  const segments = key.split('.');
  return (
    segments.length >= 2 && segments.every((segment) => segment.length > 0)
  );
}
