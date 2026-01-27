/**
 * Extract translation key from selected text
 * Pattern: t('key.name') or t("key.name")
 */
export function extractTranslationKey(text: string): string | null {
  const keyPattern = /t\(['"](.+?)['"]\)/;
  const match = text.match(keyPattern);
  return match ? match[1] : null;
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
