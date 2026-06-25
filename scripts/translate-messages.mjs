// Generates messages/{locale}.json for 12 new languages from messages/en.json
// Usage: node scripts/translate-messages.mjs
// Requires GOOGLE_TRANSLATE_API_KEY in .env.local

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// Load .env.local
const envPath = path.join(ROOT, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const [k, ...rest] = line.split("=");
    if (k && rest.length) process.env[k.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
  }
}

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
if (!API_KEY) throw new Error("GOOGLE_TRANSLATE_API_KEY not set");

const TARGETS = ["zh-TW", "ru", "ar", "uk", "kk", "it", "es", "id", "pt", "de", "fr", "pl"];

const source = JSON.parse(readFileSync(path.join(ROOT, "messages/en.json"), "utf8"));

// Collect all leaf string paths + values
function collectLeaves(obj, prefix = "") {
  const leaves = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      leaves.push({ key: fullKey, value });
    } else if (value && typeof value === "object") {
      leaves.push(...collectLeaves(value, fullKey));
    }
  }
  return leaves;
}

// Set nested value by dot-separated key
function setNested(obj, key, value) {
  const parts = key.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

async function translateBatch(texts, target) {
  const BATCH = 128;
  const results = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: batch, source: "en", target, format: "text" }),
      }
    );
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    // Decode HTML entities that Google sometimes returns
    for (const t of data.data.translations) {
      const text = t.translatedText
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"');
      results.push(text);
    }
  }
  return results;
}

const leaves = collectLeaves(source);
const origTexts = leaves.map((l) => l.value);

for (const target of TARGETS) {
  const outPath = path.join(ROOT, `messages/${target}.json`);
  // Skip only if file was previously translated (non-EN content detected)
  // Remove this check to force retranslation: delete the target file first
  process.stdout.write(`Translating ${target}... `);
  try {
    const translated = await translateBatch(origTexts, target);
    const result = {};
    leaves.forEach(({ key }, i) => setNested(result, key, translated[i]));
    writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n", "utf8");
    console.log("done");
  } catch (e) {
    console.error(`FAILED — ${e.message}. Writing EN fallback.`);
    writeFileSync(outPath, JSON.stringify(source, null, 2) + "\n", "utf8");
  }
}
console.log("All done.");
