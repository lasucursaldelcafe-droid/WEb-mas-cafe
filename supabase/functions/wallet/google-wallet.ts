/**
 * Google Wallet API — tarjeta de fidelización (LoyaltyObject + JWT savetowallet).
 * Requiere secrets en Supabase:
 *   GOOGLE_WALLET_ISSUER_ID
 *   GOOGLE_WALLET_SERVICE_ACCOUNT  (JSON completo de la cuenta de servicio)
 */

const WALLET_SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
const CLASS_SUFFIX = "mas_cafe_loyalty";
const LOGO_URI =
  "https://lasucursaldelcafe-droid.github.io/WEb-mas-cafe/images/brand/horizontal-azul.png";

const ORIGINS = [
  "https://xn--mascaf-gva.com",
  "http://xn--mascaf-gva.com",
  "https://www.xn--mascaf-gva.com",
  "http://www.xn--mascaf-gva.com",
  "https://lasucursaldelcafe-droid.github.io",
  "http://localhost:8080",
];

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

export type GoogleWalletConfig = {
  issuerId: string;
  serviceAccount: ServiceAccount;
};

export function googleWalletConfigured(): GoogleWalletConfig | null {
  const issuerId = Deno.env.get("GOOGLE_WALLET_ISSUER_ID")?.trim();
  const raw = Deno.env.get("GOOGLE_WALLET_SERVICE_ACCOUNT")?.trim();
  if (!issuerId || !raw) return null;
  try {
    const serviceAccount = JSON.parse(raw) as ServiceAccount;
    if (!serviceAccount.client_email || !serviceAccount.private_key) return null;
    return { issuerId, serviceAccount };
  } catch {
    return null;
  }
}

export function sanitizeObjectSuffix(memberId: string): string {
  return memberId.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function classId(issuerId: string): string {
  return `${issuerId}.${CLASS_SUFFIX}`;
}

export function objectId(issuerId: string, memberId: string): string {
  return `${issuerId}.${sanitizeObjectSuffix(memberId)}`;
}

function base64UrlEncode(data: Uint8Array | string): string {
  const bytes =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function signJwt(
  payload: Record<string, unknown>,
  serviceAccount: ServiceAccount,
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const headerPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${headerPart}.${payloadPart}`;
  const key = await importPrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function signGoogleAuthJwt(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return signJwt(
    {
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: WALLET_SCOPE,
    },
    serviceAccount,
  );
}

async function getGoogleAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const assertion = await signGoogleAuthJwt(serviceAccount);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "OAuth Google falló");
  }
  return data.access_token as string;
}

function buildLoyaltyClass(issuerId: string, brandName: string) {
  return {
    id: classId(issuerId),
    issuerName: brandName,
    reviewStatus: "UNDER_REVIEW",
    programName: "Programa de fidelización",
    programLogo: {
      sourceUri: { uri: LOGO_URI },
      contentDescription: {
        defaultValue: { language: "es", value: brandName },
      },
    },
    hexBackgroundColor: "#073954",
  };
}

function buildLoyaltyObject(
  cfg: GoogleWalletConfig,
  input: {
    memberId: string;
    displayName: string;
    points: number;
    tier: string;
    brandName: string;
  },
) {
  const id = objectId(cfg.issuerId, input.memberId);
  return {
    id,
    classId: classId(cfg.issuerId),
    state: "ACTIVE",
    accountId: input.memberId,
    accountName: input.displayName,
    loyaltyPoints: {
      label: "Puntos",
      balance: { int: input.points },
    },
    secondaryLoyaltyPoints: {
      label: "Nivel",
      balance: { string: input.tier },
    },
    barcode: {
      type: "QR_CODE",
      value: input.memberId,
      alternateText: input.memberId,
    },
    textModulesData: [
      {
        header: "Programa",
        body: input.brandName,
        id: "program",
      },
    ],
  };
}

export async function createSaveUrl(
  cfg: GoogleWalletConfig,
  input: {
    memberId: string;
    displayName: string;
    points: number;
    tier: string;
    brandName: string;
  },
): Promise<{ saveUrl: string; objectId: string }> {
  const loyaltyClass = buildLoyaltyClass(cfg.issuerId, input.brandName);
  const loyaltyObject = buildLoyaltyObject(cfg, input);

  const jwtPayload = {
    iss: cfg.serviceAccount.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: ORIGINS,
    payload: {
      loyaltyClasses: [loyaltyClass],
      loyaltyObjects: [loyaltyObject],
    },
  };

  const token = await signJwt(jwtPayload, cfg.serviceAccount);
  return {
    saveUrl: `https://pay.google.com/gp/v/save/${token}`,
    objectId: loyaltyObject.id,
  };
}

/** Actualiza puntos en un pase ya guardado (PATCH REST). */
export async function patchLoyaltyPoints(
  cfg: GoogleWalletConfig,
  memberId: string,
  points: number,
  tier: string,
): Promise<void> {
  const id = objectId(cfg.issuerId, memberId);
  const token = await getGoogleAccessToken(cfg.serviceAccount);
  const res = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loyaltyPoints: {
          label: "Puntos",
          balance: { int: points },
        },
        secondaryLoyaltyPoints: {
          label: "Nivel",
          balance: { string: tier },
        },
      }),
    },
  );
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    console.warn("Google Wallet patch:", res.status, text);
  }
}
