# Lingpick Translation Extension

A VSCode extension to improve work speed when doing translation work using i18n, by creating keys and inserting translations across multiple locale files simultaneously.

## Features

- **Add Translation Keys**: Quickly add translation keys to multiple locale files at once
- **Automatic Locale Detection**: Automatically finds and detects locale files in your workspace
- **Nested Key Support**: Supports nested translation keys (e.g., `common.welcome`, `button.submit`)
- **Multi-locale Input**: Interactive UI to input translations for each locale
- **Pretty Formatting**: Maintains clean, readable JSON formatting

## Supported Directory Patterns

The extension automatically searches for locale files in the following directories:
- `**/locales/**/*.json`
- `**/locale/**/*.json`
- `**/i18n/**/*.json`
- `**/lang/**/*.json`
- `**/languages/**/*.json`
- `**/translations/**/*.json`

## Usage

### Adding a Translation Key

1. **Open Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. **Run Command**: Type "Add Translation Key" and select it
3. **Confirm Locale Files**: The extension will show you the locale files it found
4. **Enter Key**: Input your translation key (e.g., `common.welcome`)
5. **Enter Translations**: For each locale, enter the translated text
6. **Done!**: The key and translations are added to all locale files

### Example

If you have the following structure:
```
project/
├── src/
└── locales/
    ├── en.json
    ├── ko.json
    └── ja.json
```

Running the command with:
- Key: `common.greeting`
- EN translation: `Hello`
- KO translation: `안녕하세요`
- JA translation: `こんにちは`

Will update all three files:

**en.json**:
```json
{
  "common": {
    "greeting": "Hello"
  }
}
```

**ko.json**:
```json
{
  "common": {
    "greeting": "안녕하세요"
  }
}
```

**ja.json**:
```json
{
  "common": {
    "greeting": "こんにちは"
  }
}
```

## Requirements

- VSCode 1.75.0 or higher
- Locale files in JSON format

## Extension Settings

This extension does not require any special configuration.

## Known Issues

None at this time. Please report issues on the GitHub repository.

## Release Notes

### 0.1.0

Initial release with core functionality:
- Add translation keys to multiple locale files
- Automatic locale file detection
- Interactive translation input
- Nested key support

## Contributing

Contributions are welcome! Please visit the [GitHub repository](https://github.com/Tchaikovsky1114/lingpick-translation-extension) to submit issues or pull requests.

## License

This extension is licensed under the MIT License. See the LICENSE file for details.
