# i18n Auto Translator

VS Code 익스텐션으로 Gemini AI를 사용하여 한국어 i18n 번역을 자동으로 여러 언어로 번역하고 각 언어별 JSON 파일에 자동 분배합니다.

## 기능

- 🌍 한국어 원문을 선택한 후 Ctrl+Shift+T(Mac: Cmd+Shift+T)로 즉시 번역
- 🤖 Google Gemini API를 사용한 고품질 AI 번역
- 📝 번역 결과를 자동으로 각 언어별 JSON 파일에 분배
- 🔄 번역 실패 시 자동 재시도 로직 (최대 3회)
- ⚠️ 번역 실패 시 폴백 처리 (한국어 원문 삽입)
- 🎯 중첩된 키 형식 지원 (예: `feature.title`, `settings.general.language`)
- ✅ 중복 키 검사 및 방지
- 📊 진행 상황 표시 및 완료 알림

## 설치

1. VS Code에서 이 익스텐션을 설치합니다
2. Google Gemini API 키를 [여기](https://aistudio.google.com/apikey)에서 생성합니다
3. VS Code 설정에서 API 키를 등록하거나, 첫 실행 시 입력 프롬프트에서 입력합니다

## 사용법

### 기본 사용 방법

1. TypeScript/JavaScript 파일에서 번역 키를 선택합니다:

   ```javascript
   const label = t("feature.title")
                  ^^^^^^^^^^^^^^^^
   ```

2. `Ctrl+Shift+T` (또는 Mac: `Cmd+Shift+T`)를 누릅니다

3. 한국어 원문을 입력합니다:

   ```
   기능 제목
   ```

4. 익스텐션이 자동으로:
   - Gemini API를 사용하여 설정된 모든 언어로 번역
   - 각 언어별 JSON 파일에 번역 결과 저장

### 예시

**입력:**

- 선택된 키: `t("settings.theme")`
- 한국어 원문: `어두운 모드`

**결과:**

`src/locales/ko.json`:

```json
{
  "settings": {
    "theme": "어두운 모드"
  }
}
```

`src/locales/en.json`:

```json
{
  "settings": {
    "theme": "Dark Mode"
  }
}
```

`src/locales/ja.json`:

```json
{
  "settings": {
    "theme": "ダークモード"
  }
}
```

## 설정

VS Code 설정(settings.json)에서 다음을 구성할 수 있습니다:

```json
{
  "i18nAutomation.languages": ["ko", "en", "ja", "hi"],
  "i18nAutomation.translationFilesPath": "src/i18n/{lang}.json",
  "i18nAutomation.geminiApiKey": "your-api-key-here",
  "i18nAutomation.geminiModel": "gemini-1.5-flash"
}
```

### 설정 옵션

| 옵션                                  | 설명                                         | 기본값                     |
| ------------------------------------- | -------------------------------------------- | -------------------------- |
| `i18nAutomation.languages`            | 번역 대상 언어 코드 배열                     | `["ko", "en", "ja", "hi"]` |
| `i18nAutomation.translationFilesPath` | 번역 파일 경로 패턴 (플레이스홀더: `{lang}`) | `src/i18n/{lang}.json`     |
| `i18nAutomation.geminiApiKey`         | Google Gemini API 키                         | -                          |
| `i18nAutomation.geminiModel`          | 사용할 Gemini 모델                           | `gemini-1.5-flash`         |

## 주요 기능

### 자동 재시도 로직

API 호출이 실패하거나 JSON 파싱에 실패하면 자동으로 최대 3회까지 재시도합니다. 각 재시도 사이에 지수 백오프로 대기합니다.

### 폴백 처리

모든 재시도가 실패한 경우, 한국어 원문을 모든 언어의 번역으로 사용하고 경고 메시지를 표시합니다.

### 중복 키 검사

번역을 추가하기 전에 모든 언어 파일에서 이미 해당 키가 존재하는지 확인합니다. 존재하면 오류를 표시하고 진행을 중단합니다.

### HTML 태그 및 변수 보존

프롬프트에서 HTML 태그(`<bold>`, `<highlight>` 등)와 변수(`{{name}}`, `{{email}}` 등)를 정확히 보존하도록 지시합니다.

## 요구사항

- VS Code 1.85.0 이상
- Google Gemini API 키
- 인터넷 연결

## 문제 해결

### API 키 오류

- API 키가 올바른지 확인하세요: https://aistudio.google.com/apikey
- 설정에서 `i18nAutomation.geminiApiKey`를 확인하세요

### 번역 실패

- 인터넷 연결을 확인하세요
- API 할당량을 초과했는지 확인하세요
- 디버그 콘솔(F1 → Debug Console)에서 오류 메시지를 확인하세요

### 파일이 생성되지 않음

- `i18nAutomation.translationFilesPath` 설정을 확인하세요
- 해당 디렉토리가 존재하지 않으면 자동으로 생성됩니다

## 개발

### 로컬에서 실행

```bash
# 의존성 설치
npm install

# TypeScript 컴파일
npm run compile

# 또는 watch 모드
npm run watch
```

### 빌드

```bash
npm run vscode:prepublish
```

## 라이선스

MIT

## 기여

이슈 리포트와 풀 리퀘스트를 환영합니다!
