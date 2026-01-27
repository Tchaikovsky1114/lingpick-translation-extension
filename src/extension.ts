import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for translation input
 */
interface TranslationInput {
  key: string;
  translations: Map<string, string>;
}

/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Lingpick Translation Extension is now active!');

  let disposable = vscode.commands.registerCommand('lingpick.addTranslationKey', async (uri: vscode.Uri) => {
    try {
      // Get workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      // Find all JSON files that might be locale files
      const localeFiles = await findLocaleFiles(workspaceFolder.uri.fsPath);
      
      if (localeFiles.length === 0) {
        vscode.window.showErrorMessage('No locale JSON files found in workspace');
        return;
      }

      // Show locale files to user
      const localeInfo = localeFiles.map(f => {
        const relativePath = path.relative(workspaceFolder.uri.fsPath, f);
        const locale = detectLocaleFromPath(f);
        return `${locale || 'unknown'}: ${relativePath}`;
      }).join('\n');

      const proceed = await vscode.window.showInformationMessage(
        `Found ${localeFiles.length} locale file(s):\n${localeInfo}\n\nProceed to add translation key?`,
        'Yes',
        'No'
      );

      if (proceed !== 'Yes') {
        return;
      }

      // Get translation key from user
      const key = await vscode.window.showInputBox({
        prompt: 'Enter translation key (e.g., "common.welcome" or "button.submit")',
        placeHolder: 'translation.key',
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Key cannot be empty';
          }
          if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
            return 'Key can only contain letters, numbers, dots, hyphens and underscores';
          }
          return null;
        }
      });

      if (!key) {
        return;
      }

      // Get translations for each locale
      const translations = new Map<string, string>();
      
      for (const localeFile of localeFiles) {
        const locale = detectLocaleFromPath(localeFile) || path.basename(localeFile, '.json');
        const translation = await vscode.window.showInputBox({
          prompt: `Enter translation for "${key}" in ${locale}`,
          placeHolder: `Translation text for ${locale}`,
        });

        if (translation === undefined) {
          // User cancelled
          vscode.window.showInformationMessage('Translation cancelled');
          return;
        }

        translations.set(localeFile, translation || '');
      }

      // Add translations to files
      let successCount = 0;
      let errorCount = 0;

      for (const [localeFile, translation] of translations) {
        try {
          await addTranslationToFile(localeFile, key, translation);
          successCount++;
        } catch (error) {
          console.error(`Error adding translation to ${localeFile}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        vscode.window.showInformationMessage(
          `Successfully added translation key "${key}" to ${successCount} file(s)` +
          (errorCount > 0 ? ` (${errorCount} failed)` : '')
        );
      } else {
        vscode.window.showErrorMessage('Failed to add translation key to any files');
      }

    } catch (error) {
      console.error('Error in addTranslationKey command:', error);
      vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Find all JSON files that might be locale files
 */
async function findLocaleFiles(workspacePath: string): Promise<string[]> {
  const localeFiles: string[] = [];
  
  // Common patterns for locale files
  const patterns = [
    '**/locales/**/*.json',
    '**/locale/**/*.json',
    '**/i18n/**/*.json',
    '**/lang/**/*.json',
    '**/languages/**/*.json',
    '**/translations/**/*.json',
  ];

  for (const pattern of patterns) {
    const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
    localeFiles.push(...files.map(f => f.fsPath));
  }

  // Remove duplicates
  return Array.from(new Set(localeFiles));
}

/**
 * Detect locale from file path
 */
function detectLocaleFromPath(filePath: string): string | null {
  const basename = path.basename(filePath, '.json');
  
  // Common locale patterns
  const localePatterns = [
    /^(en|ko|ja|zh|es|fr|de|it|pt|ru|ar|hi)(-[A-Z]{2})?$/i,
    /^(en|ko|ja|zh|es|fr|de|it|pt|ru|ar|hi)_[A-Z]{2}$/i,
  ];

  for (const pattern of localePatterns) {
    if (pattern.test(basename)) {
      return basename;
    }
  }

  return basename;
}

/**
 * Add translation to a JSON file
 */
async function addTranslationToFile(filePath: string, key: string, value: string): Promise<void> {
  let data: any = {};

  // Read existing file if it exists
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    try {
      data = JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON in ${filePath}`);
    }
  }

  // Set nested key
  const keys = key.split('.');
  let current = data;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;

  // Write back to file with pretty formatting
  const jsonContent = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonContent + '\n', 'utf8');
}

/**
 * Deactivate the extension
 */
export function deactivate() {
  console.log('Lingpick Translation Extension is now deactivated');
}
