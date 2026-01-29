import * as vscode from 'vscode';
import { extractTranslationKey, isValidKeyFormat } from './keyExtractor';
import { resolveFilePaths, getRelativePath } from './utils/pathResolver';
import {
  keyExists,
  updateTranslationFiles,
  getUpdatedFilePaths,
} from './jsonFileManager';
import { translateWithGemini } from './geminiTranslator';

export function activate(context: vscode.ExtensionContext) {
  console.log('i18n Auto Translator extension is now active!');
  
  const disposable = vscode.commands.registerCommand(
    'i18nAutoTranslate.addTranslation',
    async () => {
      console.log('i18nAutoTranslate.addTranslation command triggered');
      try {
        await addTranslationHandler();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error occurred';
        vscode.window.showErrorMessage(`i18n Translation Error: ${message}`);
      }
    },
  );

  context.subscriptions.push(disposable);
  console.log('i18nAutoTranslate.addTranslation command registered successfully');
}

async function addTranslationHandler(): Promise<void> {
  // 1. Get active editor and selected text
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error('No active editor found. Please open a file.');
  }

  const selectedText = editor.document.getText(editor.selection).trim();
  if (!selectedText) {
    throw new Error(
      'Please select a translation key (e.g., t("feature.title"))',
    );
  }

  // 2. Extract translation key
  const key = extractTranslationKey(selectedText);
  if (!key) {
    throw new Error(
      `Invalid key format. Expected: t('key.name') or t("key.name")`,
    );
  }

  if (!isValidKeyFormat(key)) {
    throw new Error(
      `Invalid key format: "${key}". Key must contain at least one dot (e.g., "feature.title")`,
    );
  }

  // 3. Get configuration
  const config = vscode.workspace.getConfiguration('i18nAutomation');
  let languages = config.get<string[]>('languages') || ['ko', 'en', 'ja', 'hi'];
  let translationFilesPath =
    config.get<string>('translationFilesPath') || 'src/i18n/{lang}.json';
  let apiKey = config.get<string>('geminiApiKey');
  const model = config.get<string>('geminiModel') || 'gemini-2.5-flash';

  // 4. Validate and get API key if needed
  if (!apiKey) {
    apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your Google Gemini API Key',
      password: true,
      placeHolder: 'https://aistudio.google.com/apikey',
    });

    if (!apiKey) {
      throw new Error('API key is required to use this extension');
    }

    // Save API key to settings
    await config.update(
      'geminiApiKey',
      apiKey,
      vscode.ConfigurationTarget.Global,
    );
  }

  // 5. Check if key already exists in any language file
  const filePaths = resolveFilePaths(translationFilesPath, languages);
  for (const [lang, filePath] of filePaths) {
    if (keyExists(filePath, key)) {
      throw new Error(
        `Key "${key}" already exists in ${getRelativePath(filePath)}. Please choose a different key.`,
      );
    }
  }

  // 6. Prompt for Korean source text
  const koreanText = await vscode.window.showInputBox({
    prompt: 'Enter Korean source text for translation',
    placeHolder: 'Example: 로그인하기',
  });

  if (!koreanText) {
    throw new Error('Translation cancelled');
  }

  // 7. Translate using Gemini with progress indicator
  let translations;
  let translationError: string | null = null;
  
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Translating to multiple languages...',
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 0 });
      try {
        translations = await translateWithGemini(
          koreanText,
          languages,
          apiKey,
          model,
        );
      } catch (error) {
        translationError = error instanceof Error ? error.message : String(error);
      }
      progress.report({ increment: 100 });
    },
  );

  if (!translations) {
    throw new Error('Translation failed');
  }

  // 8. Check if fallback was used
  const isFallback = Object.values(translations).every((v) => v === koreanText);

  // 9. Update JSON files
  const translationMap = new Map<string, string>(Object.entries(translations));
  updateTranslationFiles(filePaths, key, translationMap);

  // 10. Show completion message
  const updatedFiles = getUpdatedFilePaths(filePaths, translationMap);
  const fileList = updatedFiles.map(getRelativePath).join(', ');

  if (isFallback) {
    const errorMsg = translationError 
      ? ` Error: ${translationError}`
      : '';
    vscode.window.showWarningMessage(
      `Translation added with fallback (Korean text).${errorMsg} Files updated: ${fileList}`,
    );
  } else {
    vscode.window.showInformationMessage(
      `Successfully added translation for key "${key}". Files updated: ${fileList}`,
    );
  }
}

export function deactivate() {}
