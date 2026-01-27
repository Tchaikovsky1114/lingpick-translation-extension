# Example Usage

This directory contains a sample project structure demonstrating how to use the Lingpick Translation Extension.

## Sample Project Structure

```
sample-project/
├── src/
│   └── i18n/
│       ├── en.json
│       ├── ko.json
│       └── ja.json
└── README.md
```

## How to Use

1. Open this `examples/sample-project` folder in VS Code
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Type "Add Translation Key" and select the command
4. Follow the prompts to add translation keys

## Example Workflow

Let's say you want to add a new greeting message:

1. **Run the command**: "Add Translation Key"
2. **Confirm locale files**: The extension will detect:
   - `en: src/i18n/en.json`
   - `ko: src/i18n/ko.json`
   - `ja: src/i18n/ja.json`
3. **Enter key**: `messages.greeting`
4. **Enter translations**:
   - EN: `Hello, welcome to our app!`
   - KO: `안녕하세요, 우리 앱에 오신 것을 환영합니다!`
   - JA: `こんにちは、アプリへようこそ！`
5. **Result**: All three locale files will be updated with the new key

## Before

**en.json**:
```json
{
  "app": {
    "name": "My App"
  }
}
```

## After

**en.json**:
```json
{
  "app": {
    "name": "My App"
  },
  "messages": {
    "greeting": "Hello, welcome to our app!"
  }
}
```

**ko.json**:
```json
{
  "app": {
    "name": "마이 앱"
  },
  "messages": {
    "greeting": "안녕하세요, 우리 앱에 오신 것을 환영합니다!"
  }
}
```

**ja.json**:
```json
{
  "app": {
    "name": "マイアプリ"
  },
  "messages": {
    "greeting": "こんにちは、アプリへようこそ！"
  }
}
```
