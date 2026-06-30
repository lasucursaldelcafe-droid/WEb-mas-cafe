/**
 * Verificación DNS en nameservers autoritativos de GoDaddy.
 * La API puede mostrar IPs de GitHub mientras el NS sigue sirviendo parking.
 */
import { execSync } from "child_process";
import {
  DOMAIN_PUNYCODE,
  GITHUB_PAGES_A_RECORDS,
} from "./domain-config.mjs";

/** IPs típicas del parking / Website Builder de GoDaddy */
export const GODADDY_PARKING_IPS = [
  "76.223.105.230",
  "13.248.243.5",
  "76.223.105.198",
  "13.248.243.4",
];

export const GODADDY_FORWARDING_URL =
  "https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com";

export const GODADDY_DNS_PANEL =
  "https://dcc.godaddy.com/control/dnsmanagement?domainName=xn--mascaf-gva.com";

function digAt(resolver, query) {
  try {
    return execSync(`dig +short @${resolver} ${query}`, { encoding: "utf8", timeout: 10000 })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function isGodaddyParkingIp(ip) {
  return GODADDY_PARKING_IPS.includes(ip);
}

/** Consulta ns41/ns42.domaincontrol.com (GoDaddy) */
export function checkAuthoritativeApex() {
  const resolvers = ["ns41.domaincontrol.com", "ns42.domaincontrol.com"];
  const results = {};

  for (const ns of resolvers) {
    const ips = digAt(ns, `${DOMAIN_PUNYCODE} A`);
    const githubOk = GITHUB_PAGES_A_RECORDS.every((ip) => ips.includes(ip));
    const hasParking = ips.some(isGodaddyParkingIp);
    results[ns] = { ips, githubOk, hasParking };
  }

  const allGithub = Object.values(results).every((r) => r.githubOk && !r.hasParking);
  const anyParking = Object.values(results).some((r) => r.hasParking);

  return { results, allGithub, anyParking, expected: GITHUB_PAGES_A_RECORDS };
}

export function formatParkingWarning() {
  return `
⚠️  GoDaddy sigue sirviendo PARKING en los nameservers autoritativos.
    La API DNS muestra IPs de GitHub, pero el dominio NO llega a GitHub Pages.
    Por eso el navegador muestra «conexión no segura» o la página de GoDaddy.

    ACCIÓN MANUAL (5 min) — solo en GoDaddy:
    1. ${GODADDY_DNS_PANEL}
    2. Sección «Reenvío» / «Forwarding» → ELIMINAR cualquier regla
    3. Desconectar «Websites + Marketing» / página «Próximamente» del dominio
    4. Guardar y esperar 10–30 min
    5. Ejecutar: npm run domain:enable-https

    Guía: docs/DOMINIO-MASCAFE-COM.md
`;
}
