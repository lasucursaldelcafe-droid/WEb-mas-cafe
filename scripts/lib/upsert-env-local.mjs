/**
 * Añade o actualiza claves en .env.local sin borrar el resto.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.join(__dirname, "../../.env.local");

function escapeValue(val) {
  const s = String(val ?? "");
  if (/[\s#"']/.test(s)) return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  return s;
}

/** @param {Record<string, string>} updates */
export function upsertEnvLocal(updates, envPath = defaultPath) {
  const lines = existsSync(envPath) ? readFileSync(envPath, "utf8").split("\n") : [];
  const keys = new Set(Object.keys(updates));
  const out = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      out.push(line);
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      out.push(line);
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (keys.has(key)) {
      out.push(`${key}=${escapeValue(updates[key])}`);
      keys.delete(key);
    } else {
      out.push(line);
    }
  }

  if (keys.size) {
    if (out.length && out[out.length - 1] !== "") out.push("");
    out.push("# Google Wallet — añadido por npm run wallet:google-auto");
    for (const key of keys) {
      out.push(`${key}=${escapeValue(updates[key])}`);
    }
  }

  writeFileSync(envPath, `${out.join("\n").replace(/\n+$/, "")}\n`, "utf8");
}
