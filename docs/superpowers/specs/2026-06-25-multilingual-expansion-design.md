# Multilingual Expansion Design — 4 → 16 Languages

**Date:** 2026-06-25  
**Status:** Implemented

## Problem

Curepick supported only 4 languages (ko/en/zh/ja), hardcoded in 4 separate places. Global expansion requires 16 languages, and manual entry across all languages is impractical — admins need one-click auto-translation.

## Solution

### Language List (single source: `src/config/i18n.ts`)

| Label | Code | Language |
|-------|------|----------|
| KR | ko | 한국어 |
| EN | en | English |
| CN | zh | 简体中文 |
| TW | zh-TW | 繁體中文 |
| JP | ja | 日本語 |
| RU | ru | Русский |
| AR | ar | العربية |
| UA | uk | Українська |
| KZ | kk | Қазақша |
| IT | it | Italiano |
| ES | es | Español |
| ID | id | Bahasa Indonesia |
| PT | pt | Português |
| DE | de | Deutsch |
| FR | fr | Français |
| PL | pl | Polski |

### Architecture

- **`SUPPORTED_LANGS`** array in `src/config/i18n.ts` is the single source of truth
- **`MultilingualValue`** type = `Partial<Record<LangCode, string>>`
- **`parseMultilingual()`** shared utility in `src/lib/utils/multilingual.ts` (replaces 3 copies)
- **`/api/admin/translate`** POST route for batch translation via Google Translate API
- **`MultilingualInput`** component redesigned: KO+EN prominent at top, 14 others in 2-column grid

### Translation UX

- "KO로 번역" / "EN으로 번역" — fills empty fields only (preserves manual edits)
- `[↺]` per-field button — retranslates single field from KO
- `[···]` menu → "Force retranslate all" — overwrites everything
- Auto-translated fields shown with light blue background

### Scope

- DB: no migration needed (JSONB columns already flexible)
- URL routing: unchanged (next-intl `locales` still `["en", "ko", "ja", "zh"]`)
- Existing 4-language data: fully backward-compatible
