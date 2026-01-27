# i18n 자동 번역 VS Code 익스텐션 개발 (최종)

사용자가 번역 키를 선택하고 Ctrl+Shift+T를 누르면, 한국어 원문을 입력받아 사용자 제공 Gemini API로 모든 언어를 JSON 형식으로 일괄 번역받아 각 `{lang}.json` 파일에 자동 분배합니다. 재시도 로직과 fallback 처리를 포함합니다.

## Steps

1. **프로젝트 초기화 및 설정 스키마** - `yo code`로 TypeScript 익스텐션 생성, [package.json](package.json)에 `@google/generative-ai` 추가, `contributes.configuration`에 `i18nAutomation.languages` (예: `["ko", "en", "ja"]`), `i18nAutomation.translationFilesPath` (예: `"src/locales/{lang}.json"`), `i18nAutomation.geminiApiKey`, `i18nAutomation.geminiModel` (기본: `"gemini-1.5-flash"`) 정의, `contributes.keybindings`에 Ctrl+Shift+T 등록

2. **API 키 관리 및 검증** - [src/extension.ts](src/extension.ts)에서 명령 실행 시 설정에서 API 키 확인 → 없으면 InputBox로 입력 요청 → `vscode.workspace.getConfiguration().update()`로 저장 → Gemini 클라이언트 초기화

3. **키 추출 및 중복 검사** - 활성 에디터의 선택 텍스트에서 번역 키 추출 (정규식: `t\(['"](.+?)['"]\)`) → 플레이스홀더 경로 패턴으로 모든 언어 파일 경로 생성 → 각 파일에서 중첩 키(`myFeature.title`) 존재 여부 확인 → 존재 시 `showErrorMessage("Key 'myFeature.title' already exists")` 후 종료

4. **한국어 원문 입력 및 일괄 번역** - InputBox로 한국어 원문 입력받기 → [src/geminiTranslator.ts](src/geminiTranslator.ts)에서 프롬프트 생성: "You are a professional i18n translator. Source is Korean. Translate to these languages: {ko, en, ja}. Return ONLY valid JSON: {\"ko\": \"...\", \"en\": \"...\", \"ja\": \"...\"}. Preserve HTML tags (<bold>, <highlight>) and variables ({{name}}) exactly. Maintain appropriate formality." → Gemini API 호출

5. **JSON 파싱 및 재시도 로직** - 응답에서 정규식 `\{[\s\S]*\}`로 JSON 추출 → `JSON.parse()` 시도 → 실패 시 최대 3회 재시도 (같은 프롬프트로 재호출) → 3회 실패 시 fallback: 원문을 모든 언어에 그대로 삽입하고 경고 메시지 표시

6. **JSON 파일 업데이트 및 완료 처리** - [src/jsonFileManager.ts](src/jsonFileManager.ts)에서 번역 결과 순회 → `{lang}` 플레이스홀더 치환하여 파일 경로 생성 → 파일 읽기 (없으면 `{}` 생성) → 중첩 키 경로를 점(`.`) 기준으로 분리하여 객체 구조 생성 및 값 삽입 → 들여쓰기 2칸으로 저장 → `vscode.window.withProgress`로 진행 표시, 완료 시 성공 알림

## Further Considerations

1. **설정 검증 및 초기화** - 익스텐션 첫 실행 시 `languages` 배열이 비어있거나 `translationFilesPath`가 미설정 시: 기본값 제안 vs 설정 안내 메시지?

2. **키 형식 유효성 검사** - 추출된 키가 `myFeature.title` 같은 유효한 형식인지 검증 (점 포함, 빈 문자열 방지)?

3. **변경사항 자동 저장** - 번역 완료 후 변경된 JSON 파일들을 자동으로 저장 vs 사용자가 직접 저장하게 둘까? (자동 저장이 편리하지만 Git diff 확인 전 저장될 수 있음)

## Implementation Details

### Configuration Schema (package.json)

```json
{
  "contributes": {
    "configuration": [
      {
        "title": "i18n Auto Translate",
        "properties": {
          "i18nAutomation.languages": {
            "type": "array",
            "items": { "type": "string" },
            "default": ["ko", "en", "ja"],
            "description": "List of language codes to translate to"
          },
          "i18nAutomation.translationFilesPath": {
            "type": "string",
            "default": "src/locales/{lang}.json",
            "description": "Path pattern for translation files. Use {lang} as placeholder"
          },
          "i18nAutomation.geminiApiKey": {
            "type": "string",
            "description": "Google Gemini API Key"
          },
          "i18nAutomation.geminiModel": {
            "type": "string",
            "default": "gemini-1.5-flash",
            "description": "Gemini model to use for translations"
          }
        }
      }
    ],
    "commands": [
      {
        "command": "i18nAutoTranslate.addTranslation",
        "title": "Add i18n Translation"
      }
    ],
    "keybindings": [
      {
        "command": "i18nAutoTranslate.addTranslation",
        "key": "ctrl+shift+t",
        "mac": "cmd+shift+t",
        "when": "editorTextFocus"
      }
    ]
  }
}
```

### Key Components

- **src/extension.ts** - 메인 명령어 핸들러, API 키 관리, 워크플로우 조율
- **src/geminiTranslator.ts** - Gemini API 호출, 재시도 로직, JSON 파싱
- **src/jsonFileManager.ts** - JSON 파일 읽기/쓰기, 중첩 키 처리
- **src/keyExtractor.ts** - 선택 텍스트에서 키 추출, 정규식 처리
- **src/utils/pathResolver.ts** - 플레이스홀더 경로 치환 로직

### Gemini Prompt Template

```
You are a professional i18n translator specializing in software localization.
Source language is Korean.

Translate the following Korean text to: {LANGUAGES_LIST}

IMPORTANT RULES:
1. HTML tags like <bold>, <highlight>, <i>, <br/> must be preserved exactly as-is
2. Variables like {{name}}, {{email}} must be preserved exactly as-is
3. Return ONLY a valid JSON object in this format:
{
  "ko": "Korean translation here",
  "en": "English translation here",
  "ja": "Japanese translation here"
}
4. Do not add any markdown formatting, backticks, or additional text
5. Maintain appropriate formality and tone based on context

Korean text to translate:
{KOREAN_TEXT}

Return the JSON object only:
```

### Error Handling Flow

1. Gemini API call fails → Show error message with retry option
2. JSON parsing fails → Retry up to 3 times with same prompt
3. 3 retries exhausted → Fallback: insert Korean text for all languages, show warning
4. File write fails → Show error with file path, option to retry
5. Key already exists → Show error, prevent overwrite
