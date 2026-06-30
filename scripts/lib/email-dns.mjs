/**
 * DNS de correo institucional — Zoho Mail (gratis) e ImprovMX (reenvío).
 */
import { DOMAIN_DISPLAY, DOMAIN_PUNYCODE } from "./domain-config.mjs";
import { getDnsRecords, putMxRecords, putTxtRecords } from "./godaddy-api.mjs";

export const MAILBOXES = {
  admin: `administracion@${DOMAIN_DISPLAY}`,
  hola: `hola@${DOMAIN_DISPLAY}`,
};

/** Zoho Mail gratuito — hasta 5 usuarios, buzón completo enviar/recibir */
export const ZOHO_MX = [
  { data: "mx.zoho.com", priority: 10 },
  { data: "mx2.zoho.com", priority: 20 },
  { data: "mx3.zoho.com", priority: 50 },
];

export const ZOHO_SPF = "v=spf1 include:zoho.com ~all";

/** ImprovMX — solo reenvío (recibir en @dominio, entregar a Gmail personal) */
export const IMPROVMX_MX = [
  { data: "mx1.improvmx.com", priority: 10 },
  { data: "mx2.improvmx.com", priority: 20 },
];

export const IMPROVMX_SPF = "v=spf1 include:spf.improvmx.com ~all";

export function providerMx(provider) {
  if (provider === "improvmx") return IMPROVMX_MX;
  return ZOHO_MX;
}

export function providerSpf(provider) {
  if (provider === "improvmx") return IMPROVMX_SPF;
  return ZOHO_SPF;
}

export async function getEmailDnsStatus(domain = DOMAIN_PUNYCODE) {
  const records = await getDnsRecords(domain);
  const mx = records.filter((r) => r.type === "MX");
  const txtAt = records.filter((r) => r.type === "TXT" && r.name === "@");
  const dkim = records.filter(
    (r) => r.type === "TXT" && String(r.name).includes("_domainkey")
  );
  const dmarc = records.filter((r) => r.type === "TXT" && r.name === "_dmarc");

  let provider = null;
  if (mx.some((r) => r.data?.includes("zoho"))) provider = "zoho";
  else if (mx.some((r) => r.data?.includes("improvmx"))) provider = "improvmx";
  else if (mx.length) provider = "other";

  return { mx, txtAt, dkim, dmarc, provider, records };
}

export async function addZohoVerificationTxt(verificationValue, { dryRun = false } = {}) {
  const { txtAt } = await getEmailDnsStatus();
  const existing = txtAt.map((r) => r.data).filter(Boolean);
  const value = verificationValue.trim();
  if (!value) throw new Error("Falta el valor TXT de verificación de Zoho");

  const merged = [...new Set([...existing, value])];
  return putTxtRecords("@", merged, DOMAIN_PUNYCODE, { dryRun });
}

export async function configureEmailDelivery(
  provider = "zoho",
  { verificationTxt, dryRun = false } = {}
) {
  const mx = providerMx(provider);
  const spf = providerSpf(provider);

  const { txtAt } = await getEmailDnsStatus();
  const txtValues = txtAt.map((r) => r.data).filter(Boolean);

  if (verificationTxt) {
    txtValues.push(verificationTxt.trim());
  }

  const hasSpf = txtValues.some((t) => t.startsWith("v=spf1"));
  if (!hasSpf) txtValues.push(spf);

  const uniqueTxt = [...new Set(txtValues)];

  const mxResult = await putMxRecords(mx, DOMAIN_PUNYCODE, { dryRun });
  const txtResult = await putTxtRecords("@", uniqueTxt, DOMAIN_PUNYCODE, { dryRun });

  return { provider, mx: mxResult, txt: txtResult };
}

export async function addDkimRecord(selector, dkimValue, { dryRun = false } = {}) {
  const name = selector.includes("_domainkey") ? selector : `${selector}._domainkey`;
  const value = dkimValue.trim();
  if (!value) throw new Error("Falta el valor DKIM de Zoho");
  return putTxtRecords(name, [value], DOMAIN_PUNYCODE, { dryRun });
}
