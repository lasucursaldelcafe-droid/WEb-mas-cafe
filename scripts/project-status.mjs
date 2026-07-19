#!/usr/bin/env node
/**
 * Diagnóstico completo del proyecto — qué falta para terminar.
 *
 * Uso:
 *   npm run project:status
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  DOMAIN_DISPLAY,
  DOMAIN_PUNYCODE,
  DOMAIN_WWW,
  GITHUB_PAGES_SETTINGS,
  GODADDY_DNS_PANEL,
} from "./lib/domain-config.mjs";
import { checkApexDns, checkWwwDns } from "./lib/dns-check.mjs";
import { getPagesConfig, getPagesHealth, isCertificateReady } from "./lib/github-pages-api.mjs";

loadEnvLocal();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadJson(rel) {
  const p = path.join(root, rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

async function httpCode(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

function hasEnv(keys) {
  return keys.every((k) => Boolean(process.env[k]?.trim()));
}

function item(status, label, detail = "", action = "") {
  return { status, label, detail, action };
}

const STATUS_ICON = {
  ok: "✅",
  pending: "⏳",
  blocked: "❌",
  optional: "○",
};

async function main() {
  const settings = loadJson("content/settings.json") || {};
  const site = loadJson("content/site.json") || {};
  const items = [];

  const apex = checkApexDns();
  const www = checkWwwDns();
  items.push(
    apex.ok
      ? item("ok", "DNS apex (@)", apex.results.join(", "))
      : item("blocked", "DNS apex (@)", apex.results.join(", ") || "vacío", "npm run domain:configure"),
  );
  items.push(
    www.ok
      ? item("ok", "DNS www", www.results.join(", "))
      : item("blocked", "DNS www", www.results.join(", ") || "vacío", "CNAME www → lasucursaldelcafe-droid.github.io"),
  );

  const httpWww = await httpCode(`http://www.${DOMAIN_PUNYCODE}/`);
  const httpApex = await httpCode(`http://${DOMAIN_PUNYCODE}/`);
  items.push(
    httpWww === 200 || httpApex === 200
      ? item("ok", "HTTP sitio en mascafé.com", `www=${httpWww} apex=${httpApex}`)
      : item("pending", "HTTP sitio", "Sin respuesta 200", "Esperar propagación DNS o revisar GoDaddy"),
  );

  const httpsWww = await httpCode(`https://www.${DOMAIN_PUNYCODE}/`);
  const httpsReady = settings.seo?.httpsReady === true;
  items.push(
    httpsReady && httpsWww === 200
      ? item("ok", "HTTPS + candado", settings.seo?.siteUrl || "")
      : item("blocked", "HTTPS + candado", `HTTP ${httpsWww || "sin respuesta"} · httpsReady=${httpsReady}`, "npm run domain:enable-https -- --wait --kickstart --try-www"),
  );

  let pages = null;
  let health = null;
  const hasGh = hasEnv(["GITHUB_TOKEN"]) || hasEnv(["GH_TOKEN"]) || hasEnv(["GH_PAGES_PAT"]);
  if (hasGh) {
    try {
      pages = await getPagesConfig();
      const cert = pages?.https_certificate?.state || "—";
      const ready = isCertificateReady(pages);
      items.push(
        ready
          ? item("ok", "Certificado GitHub Pages", `${cert} · dominio=${pages?.cname}`)
          : item("pending", "Certificado GitHub Pages", `${cert} · dominio=${pages?.cname}`, "App Windows o workflow enable-https"),
      );
      try {
        health = await getPagesHealth({ retries: 2, delayMs: 2000 });
        const d = health?.domain;
        items.push(
          d?.is_valid && d?.is_https_eligible
            ? item("ok", "GitHub valida dominio", `https_eligible=${d?.is_https_eligible}`)
            : item("pending", "GitHub valida dominio", JSON.stringify(d || {}), GITHUB_PAGES_SETTINGS),
        );
      } catch {
        items.push(item("pending", "GitHub health check", "Timeout", GITHUB_PAGES_SETTINGS));
      }
    } catch (err) {
      items.push(item("blocked", "GitHub API", err.message, "Añadir GH_PAGES_PAT en .env.local"));
    }
  } else {
    items.push(item("optional", "GitHub API", "Sin token local", "GH_PAGES_PAT en .env.local o usar CI"));
  }

  const website = site.brand?.website || "";
  items.push(
    website.includes("mascafé.com") || website.includes(DOMAIN_PUNYCODE)
      ? item("ok", "site.json website", website)
      : item("pending", "site.json website", website, "Actualizar a https://www.mascafé.com"),
  );

  items.push(
    hasEnv(["GODADDY_API_KEY", "GODADDY_API_SECRET"])
      ? item("ok", "Credenciales GoDaddy", "Configuradas")
      : item("optional", "Credenciales GoDaddy", "Faltan en .env.local", GODADDY_DNS_PANEL),
  );

  items.push(
    hasEnv(["SUPABASE_URL"]) && (hasEnv(["SUPABASE_PUBLISHABLE_KEY"]) || hasEnv(["SUPABASE_ANON_KEY"]))
      ? item("ok", "Supabase wallet", process.env.SUPABASE_URL?.replace(/https:\/\//, ""))
      : item("optional", "Supabase wallet", "Fase 2 — backend fidelización", "npm run wallet:connect"),
  );

  const saPath = path.join(root, "secrets/google-wallet-sa.json");
  items.push(
    existsSync(saPath)
      ? item("ok", "Google Wallet SA", "secrets/google-wallet-sa.json")
      : item("optional", "Google Wallet SA", "Fase 2 — tarjeta Android", "secrets/README.md"),
  );

  const blocked = items.filter((i) => i.status === "blocked");
  const pending = items.filter((i) => i.status === "pending");

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Estado del proyecto — Más Café / mascafé.com");
  console.log("═══════════════════════════════════════════════════\n");

  for (const i of items) {
    console.log(`  ${STATUS_ICON[i.status]} ${i.label}`);
    if (i.detail) console.log(`     ${i.detail}`);
    if (i.action && i.status !== "ok") console.log(`     → ${i.action}`);
    console.log("");
  }

  console.log("─── Resumen ───");
  if (blocked.length === 0 && pending.length === 0) {
    console.log("✅ Proyecto listo para cierre (fase estática).\n");
    console.log("Siguiente: fase wallet (opcional) — ver proyecto-mas-cafe/migracion/TERMINAR-PROYECTO.md\n");
    process.exit(0);
  }

  if (blocked.some((i) => i.label.includes("HTTPS"))) {
    console.log("🔴 BLOQUEADOR PRINCIPAL: HTTPS sin certificado válido.");
    console.log("   Guía paso a paso: proyecto-mas-cafe/migracion/TERMINAR-PROYECTO.md\n");
  }

  console.log(`   Pendientes: ${pending.length} · Bloqueados: ${blocked.length}\n`);
  process.exit(blocked.length ? 1 : 0);
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});
