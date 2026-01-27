import { GoogleGenerativeAI } from '@google/generative-ai';

interface TranslationResult {
  [lang: string]: string;
}

/**
 * Generate translation prompt
 */
function generatePrompt(koreanText: string, languages: string[]): string {
  const languageList = languages.join(', ');

  return `You are a professional i18n translator specializing in software localization.
Source language is Korean.

Translate the following Korean text to: ${languageList}

IMPORTANT RULES:
1. HTML tags like <bold>, <highlight>, <i>, <br/> must be preserved exactly as-is
2. Variables like {{name}}, {{email}} must be preserved exactly as-is
3. Return ONLY a valid JSON object in this format:
{
  ${languages.map((lang) => `"${lang}": "translation here"`).join(',\n  ')}
}
4. Do not add any markdown formatting, backticks, or additional text
5. Maintain appropriate formality and tone based on context

Korean text to translate:
${koreanText}

Return the JSON object only:`;
}

/**
 * Extract JSON object from response text using regex
 */
function extractJSON(text: string): string | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

/**
 * Translate using Gemini API with retry logic
 */
export async function translateWithGemini(
  koreanText: string,
  languages: string[],
  apiKey: string,
  model: string,
  maxRetries: number = 3,
): Promise<TranslationResult> {
  const client = new GoogleGenerativeAI(apiKey);
  const geminiModel = client.getGenerativeModel({ model });

  const prompt = generatePrompt(koreanText, languages);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await geminiModel.generateContent(prompt);
      const responseText = response.response.text();

      // Extract JSON from response
      const jsonStr = extractJSON(responseText);
      if (!jsonStr) {
        throw new Error('No JSON object found in response');
      }

      // Parse JSON
      const result = JSON.parse(jsonStr) as TranslationResult;

      // Validate that all languages are present
      for (const lang of languages) {
        if (!(lang in result) || !result[lang]) {
          throw new Error(`Missing translation for language: ${lang}`);
        }
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Translation attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed, return fallback
  console.error(`All ${maxRetries} translation attempts failed:`, lastError);
  return createFallbackTranslation(koreanText, languages);
}

/**
 * Create fallback translation (Korean text for all languages)
 */
function createFallbackTranslation(
  koreanText: string,
  languages: string[],
): TranslationResult {
  const result: TranslationResult = {};
  for (const lang of languages) {
    result[lang] = koreanText;
  }
  return result;
}
