#!/usr/bin/env node
/**
 * Configura Cloudflare para HTTPS delante de GitHub Pages (SSL en ~15 min).
 * Requiere: CLOUDFLARE_API_TOKEN (+ CLOUDFLARE_ACCOUNT_ID si la zona no existe).
 * Opcional: GODADDY_* para cambiar nameservers automáticamente.
 *
 * Uso:
 *   npm run domain:cloudflare-https
 *   npm run domain:cloudflare-https -- --dry-run
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  DOMAIN_PUNYCODE,
  GITHUB_PAGES_A_RECORDS,
  GITHUB_PAGES_HOST,
} from "./lib/domain-config.mjs";
import { putNameservers } from "./lib/godaddy-api.mjs";

loadEnvLocal();

const CF_API = "https://api.cloudflare.com/client/v4";
const dryRun = process.argv.includes("--dry-run");

function cfToken() {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "Falta CLOUDFLARE_API_TOKEN.\n" +
        "Crear en: Cloudflare Dashboard → My Profile → API Tokens → Edit zone DNS\n" +
        "Añadir a GitHub Secrets o .env.local",
    );
  }
  return token;
}

async function cfApi(path, options = {}) {
  const res = await fetch(`${CF_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${cfToken()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const body = await res.json();
  if (!body.success) {
    throw new Error(`Cloudflare ${path}: ${JSON.stringify(body.errors || body)}`);
  }
  return body.result;
}

async function findOrCreateZone() {
  const existing = await cfApi(`/zones?name=${DOMAIN_PUNYCODE}&status=active`);
  if (existing?.length) return existing[0];

  const pending = await cfApi(`/zones?name=${DOMAIN_PUNYCODE}`);
  if (pending?.length) return pending[0];

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  if (!accountId) {
    throw new Error(
      "Zona no existe en Cloudflare. Crea el sitio en dash.cloudflare.com o define CLOUDFLARE_ACCOUNT_ID",
    );
  }

  if (dryRun) {
    return { id: "dry-run", name: DOMAIN_PUNYCODE, name_servers: ["ns1.example.com"] };
  }

  return cfApi("/zones", {
    method: "POST",
    body: JSON.stringify({
      name: DOMAIN_PUNYCODE,
      account: { id: accountId },
      jump_start: false,
    }),
  });
}

async function ensureDnsRecords(zoneId) {
  const existing = await cfApi(`/zones/${zoneId}/dns_records?per_page=100`);
  const byKey = new Map(existing.map((r) => [`${r.type}:${r.name}`, r]));

  for (const ip of GITHUB_PAGES_A_RECORDS) {
    const name = DOMAIN_PUNYCODE;
    const key = `A:${name}`;
    const payload = {
      type: "A",
      name: "@",
      content: ip,
      ttl: 1,
      proxied: true,
    };
    const found = byKey.get(key);
    if (dryRun) {
      console.log(`  [dry-run] A @ → ${ip} (proxied)`);
      continue;
    }
    if (found) {
      await cfApi(`/zones/${zoneId}/dns_records/${found.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    } else {
      await cfApi(`/zones/${zoneId}/dns_records`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
  }

  const wwwKey = `CNAME:www.${DOMAIN_PUNYCODE}`;
  const wwwPayload = {
    type: "CNAME",
    name: "www",
    content: GITHUB_PAGES_HOST,
    ttl: 1,
    proxied: true,
  };
  const wwwFound = [...byKey.entries()].find(([k]) => k.startsWith("CNAME:www"));
  if (dryRun) {
    console.log(`  [dry-run] CNAME www → ${GITHUB_PAGES_HOST} (proxied)`);
    return;
  }
  if (wwwFound) {
    const rec = wwwFound[1];
    await cfApi(`/zones/${zoneId}/dns_records/${rec.id}`, {
      method: "PATCH",
      body: JSON.stringify(wwwPayload),
    });
  } else {
    await cfApi(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: JSON.stringify(wwwPayload),
    });
  }
}

async function configureSsl(zoneId) {
  if (dryRun) {
    console.log("  [dry-run] SSL Full + Always HTTPS");
    return;
  }
  await cfApi(`/zones/${zoneId}/settings/ssl`, {
    method: "PATCH",
    body: JSON.stringify({ value: "full" }),
  });
  await cfApi(`/zones/${zoneId}/settings/always_use_https`, {
    method: "PATCH",
    body: JSON.stringify({ value: "on" }),
  });
}

async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Cloudflare HTTPS — mascafé.com");
  console.log("═══════════════════════════════════════════════════\n");

  const zone = await findOrCreateZone();
  console.log(`  Zona: ${zone.name} (${zone.id})`);
  console.log(`  Nameservers: ${(zone.name_servers || []).join(", ")}`);

  await ensureDnsRecords(zone.id);
  console.log("  ✅ Registros DNS (proxied)");

  await configureSsl(zone.id);
  console.log("  ✅ SSL Full + Always HTTPS");

  if (
    zone.name_servers?.length &&
    process.env.GODADDY_API_KEY &&
    process.env.GODADDY_API_SECRET
  ) {
    const ns = await putNameservers(zone.name_servers, { dryRun });
    console.log(`  ✅ GoDaddy nameservers → Cloudflare (${ns.updated} NS)`);
  } else if (zone.name_servers?.length) {
    console.log("\n  ⚠ Cambia nameservers en GoDaddy manualmente:");
    for (const ns of zone.name_servers) console.log(`    • ${ns}`);
  }

  console.log("\n✅ Cloudflare configurado. Espera 5–15 min y prueba https://www.mascafé.com/\n");
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});
