#!/usr/bin/env node
/**
 * Configura correo institucional @mascafé.com vía DNS en GoDaddy.
 *
 * Recomendado: Zoho Mail gratis → buzón administracion@mascafé.com
 *
 * Uso:
 *   npm run email:status
 *   npm run email:verify-domain -- --txt "zoho-verification=XXXX"
 *   npm run email:configure -- --provider zoho
 *   npm run email:configure -- --provider zoho --txt "zoho-verification=XXXX"
 *   npm run email:dkim -- --selector zmail --value "v=DKIM1; k=rsa; p=..."
 *   npm run email:configure -- --dry-run
 *
 * Variables: GODADDY_API_KEY, GODADDY_API_SECRET (.env.local o GitHub Secrets)
 */
import { loadEnvLocal } from "./lib/load-env-local.mjs";
import {
  DOMAIN_DISPLAY,
  DOMAIN_PUNYCODE,
  GODADDY_DNS_PANEL,
} from "./lib/domain-config.mjs";
import { testGodaddyCredentials } from "./lib/godaddy-api.mjs";
import {
  MAILBOXES,
  ZOHO_MX,
  addDkimRecord,
  addZohoVerificationTxt,
  configureEmailDelivery,
  getEmailDnsStatus,
} from "./lib/email-dns.mjs";

loadEnvLocal();

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const dryRun = process.argv.includes("--dry-run");
const mode = process.argv.includes("--verify-only")
  ? "verify"
  : process.argv.includes("--dkim")
    ? "dkim"
    : process.argv.includes("--status")
      ? "status"
      : "configure";

const provider = argValue("--provider") || "zoho";
const verificationTxt = argValue("--txt");
const dkimSelector = argValue("--selector") || "zmail";
const dkimValue = argValue("--value");

function header(title) {
  console.log(`\n${"═".repeat(51)}`);
  console.log(`  ${title}`);
  console.log(`  Dominio: ${DOMAIN_DISPLAY} (${DOMAIN_PUNYCODE})`);
  console.log(`${"═".repeat(51)}\n`);
}

async function showStatus() {
  const status = await getEmailDnsStatus();
  console.log("▸ Buzones objetivo");
  console.log(`  • Administración: ${MAILBOXES.admin}`);
  console.log(`  • Contacto web:   ${MAILBOXES.hola}`);
  console.log("");

  console.log("▸ MX actuales");
  if (!status.mx.length) {
    console.log("  (ninguno — correo aún no configurado)");
  } else {
    for (const r of status.mx) {
      console.log(`  ${r.priority} ${r.data}`);
    }
    console.log(`  Proveedor detectado: ${status.provider ?? "desconocido"}`);
  }

  console.log("\n▸ TXT en @");
  if (!status.txtAt.length) console.log("  (ninguno)");
  else status.txtAt.forEach((r) => console.log(`  ${r.data}`));

  console.log("\n▸ DKIM");
  if (!status.dkim.length) console.log("  (pendiente — añadir tras crear buzón en Zoho)");
  else status.dkim.forEach((r) => console.log(`  ${r.name}: ${r.data.slice(0, 60)}...`));

  console.log("\n─── Próximo paso ───");
  if (!status.mx.length) {
    console.log("1. Crear cuenta Zoho Mail gratis: https://www.zoho.com/mail/");
    console.log("2. Añadir dominio mascafé.com y copiar TXT de verificación");
    console.log("3. npm run email:verify-domain -- --txt \"zoho-verification=...\"");
    console.log("4. Crear buzón administracion@mascafé.com en Zoho");
    console.log("5. npm run email:configure -- --provider zoho");
    console.log("6. npm run email:dkim -- --selector zmail --value \"...\"");
  } else {
    console.log("DNS de correo aplicado. Prueba enviar/recibir desde el buzón.");
  }
  console.log(`\nPanel DNS: ${GODADDY_DNS_PANEL}\n`);
}

async function main() {
  header("Correo institucional — Más Café");

  if (!process.env.GODADDY_API_KEY || !process.env.GODADDY_API_SECRET) {
    console.error("❌ Faltan GODADDY_API_KEY y GODADDY_API_SECRET");
    process.exit(1);
  }

  await testGodaddyCredentials();

  if (mode === "status" || process.argv.includes("--status")) {
    await showStatus();
    return;
  }

  if (mode === "verify") {
    if (!verificationTxt) {
      console.error("❌ Usa: npm run email:verify-domain -- --txt \"zoho-verification=XXXX\"");
      process.exit(1);
    }
    console.log("▸ Añadir TXT de verificación Zoho");
    const result = await addZohoVerificationTxt(verificationTxt, { dryRun });
    console.log(dryRun ? JSON.stringify(result, null, 2) : "  ✅ TXT añadido en GoDaddy");
    console.log("\n  → En Zoho Admin → Dominios → Verificar dominio");
    return;
  }

  if (mode === "dkim") {
    if (!dkimValue) {
      console.error("❌ Usa: npm run email:dkim -- --selector zmail --value \"v=DKIM1; ...\"");
      process.exit(1);
    }
    console.log(`▸ Añadir DKIM (${dkimSelector})`);
    const result = await addDkimRecord(dkimSelector, dkimValue, { dryRun });
    console.log(dryRun ? JSON.stringify(result, null, 2) : "  ✅ DKIM añadido");
    return;
  }

  console.log(`▸ Configurar entrega de correo (${provider})`);
  if (provider === "zoho") {
    console.log("  MX:", ZOHO_MX.map((r) => `${r.priority} ${r.data}`).join(", "));
  }

  if (!dryRun) {
    console.log("\n  ⚠️  Esto cambia los MX del dominio. Asegúrate de tener el buzón creado en Zoho.");
    console.log("  Si solo quieres ver qué haría: añade --dry-run\n");
  }

  const result = await configureEmailDelivery(provider, {
    verificationTxt,
    dryRun,
  });

  if (dryRun) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("  ✅ MX configurados");
    console.log("  ✅ SPF en TXT @");
    console.log("\n  Espera 15–60 min y prueba:");
    console.log(`  • Enviar a ${MAILBOXES.admin}`);
    console.log("  • npm run email:status");
  }
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});
