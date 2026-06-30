/**
 * Diagnóstico y auto-reparación de permisos Google Cloud / Firebase.
 */
import {
  FIREBASE_PROJECT,
  REQUIRED_APIS,
  getAccessToken,
  enableApis,
  getAuthConfig,
  ensureFirestoreDatabase,
  configureAuthProviders,
} from "./firebase-setup-api.mjs";
import {
  LINKS,
  REQUIRED_CI_ROLES,
  apiEnableLink,
  billingInstructions,
  oauthConsentInstructions,
} from "./google-console-links.mjs";

export async function getProjectNumber(token, projectId = FIREBASE_PROJECT) {
  const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}`;
  const res = await apiFetch(token, url);
  if (!res.ok) return null;
  return res.json?.projectNumber ? String(res.json.projectNumber) : null;
}

async function apiFetch(token, url, options = {}) {
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json, text };
}

export async function checkBillingEnabled(token, projectId = FIREBASE_PROJECT) {
  const url = `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`;
  const res = await apiFetch(token, url);
  if (!res.ok) {
    return {
      enabled: false,
      reason: res.json?.error?.message || `HTTP ${res.status}`,
      needsOwner: res.status === 403,
    };
  }
  const enabled = Boolean(res.json?.billingEnabled);
  return {
    enabled,
    account: res.json?.billingAccountName || null,
    reason: enabled ? null : "Sin cuenta de facturación vinculada",
  };
}

export async function getIamPolicy(token, projectId = FIREBASE_PROJECT) {
  const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`;
  const res = await apiFetch(token, url, { method: "POST", body: {} });
  if (!res.ok) return null;
  return res.json;
}

function memberHasRole(policy, member, roleId) {
  if (!policy?.bindings) return false;
  return policy.bindings.some(
    (b) => b.role === roleId && (b.members || []).includes(member)
  );
}

export async function checkServiceAccountRoles(token, serviceAccountEmail, projectId = FIREBASE_PROJECT) {
  const member = `serviceAccount:${serviceAccountEmail}`;
  const policy = await getIamPolicy(token, projectId);
  if (!policy) {
    return {
      ok: false,
      missing: REQUIRED_CI_ROLES.map((r) => r.id),
      error: "No se pudo leer IAM (necesitas Owner o Project IAM Admin con tu cuenta humana)",
      fixLink: LINKS.iamGrant,
    };
  }

  const missing = REQUIRED_CI_ROLES.filter((r) => !memberHasRole(policy, member, r.id)).map(
    (r) => r.id
  );

  return {
    ok: missing.length === 0,
    missing,
    alreadyHadAll: missing.length === 0,
  };
}

export async function ensureServiceAccountRoles(token, serviceAccountEmail, projectId = FIREBASE_PROJECT) {
  const member = `serviceAccount:${serviceAccountEmail}`;
  const policy = await getIamPolicy(token, projectId);
  if (!policy) {
    return {
      ok: false,
      granted: [],
      missing: REQUIRED_CI_ROLES.map((r) => r.id),
      error: "No se pudo leer IAM (necesitas Owner o Project IAM Admin con tu cuenta humana)",
      fixLink: LINKS.iamGrant,
    };
  }

  const missing = REQUIRED_CI_ROLES.filter((r) => !memberHasRole(policy, member, r.id)).map(
    (r) => r.id
  );

  if (missing.length === 0) {
    return { ok: true, granted: [], missing: [], alreadyHadAll: true };
  }

  const newBindings = [...(policy.bindings || [])];
  for (const roleId of missing) {
    const existing = newBindings.find((b) => b.role === roleId);
    if (existing) {
      if (!existing.members.includes(member)) existing.members.push(member);
    } else {
      newBindings.push({ role: roleId, members: [member] });
    }
  }

  const setUrl = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:setIamPolicy`;
  const setRes = await apiFetch(token, setUrl, {
    method: "POST",
    body: { policy: { ...policy, bindings: newBindings } },
  });

  if (!setRes.ok) {
    return {
      ok: false,
      granted: [],
      missing,
      error: setRes.json?.error?.message || setRes.text,
      fixLink: LINKS.iamGrant,
    };
  }

  const stillMissing = REQUIRED_CI_ROLES.filter(
    (r) => !memberHasRole(setRes.json, member, r.id)
  ).map((r) => r.id);

  return {
    ok: stillMissing.length === 0,
    granted: missing.filter((r) => !stillMissing.includes(r)),
    missing: stillMissing,
    policyUpdated: true,
  };
}

export async function checkApiEnabled(token, service, projectId = FIREBASE_PROJECT) {
  const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/${service}`;
  const res = await apiFetch(token, url);
  const state = res.json?.state;
  return { service, enabled: state === "ENABLED", state: state || "UNKNOWN" };
}

export async function checkAllApis(token, projectId = FIREBASE_PROJECT) {
  const checks = await Promise.all(
    REQUIRED_APIS.map((s) => checkApiEnabled(token, s, projectId))
  );
  return checks;
}

export async function ensureOAuthConsentBasics(token, projectId = FIREBASE_PROJECT) {
  const projectNumber = await getProjectNumber(token, projectId);
  if (!projectNumber) {
    return { ok: false, reason: "No se pudo leer projectNumber", fixLink: LINKS.oauthConsent };
  }

  const brandUrl = `https://oauth2.googleapis.com/v1/projects/${projectNumber}/brands`;
  const list = await apiFetch(token, brandUrl);
  let brandName = list.json?.brands?.[0]?.name;

  if (!brandName && list.ok) {
    const create = await apiFetch(token, brandUrl, {
      method: "POST",
      body: {
        applicationTitle: "Más Café Wallet",
        supportEmail: process.env.WALLET_SUPPORT_EMAIL || "hola@mascafé.com",
      },
    });
    brandName = create.json?.name;
    if (!create.ok) {
      return {
        ok: false,
        reason: create.json?.error?.message || "No se pudo crear OAuth brand",
        fixLink: LINKS.oauthConsent,
        manual: oauthConsentInstructions(),
      };
    }
  }

  if (!brandName) {
    return { ok: false, reason: "OAuth consent no configurado", fixLink: LINKS.oauthConsent };
  }

  return { ok: true, brandName };
}

export async function runWalletDiagnostics(credentials, { checkOnly = false } = {}) {
  const token = await getAccessToken(credentials);
  const saEmail = credentials.client_email;
  const report = {
    project: FIREBASE_PROJECT,
    serviceAccount: saEmail,
    checks: [],
    blockers: [],
    warnings: [],
    links: LINKS,
  };

  const add = (id, status, message, fix) => {
    report.checks.push({ id, status, message, fix });
    if (status === "fail") report.blockers.push({ id, message, fix });
    if (status === "warn") report.warnings.push({ id, message, fix });
  };

  add("credentials", "ok", `Cuenta de servicio: ${saEmail}`, null);

  const billing = await checkBillingEnabled(token);
  add(
    "billing",
    billing.enabled ? "ok" : "fail",
    billing.enabled
      ? `Facturación activa (${billing.account || "vinculada"})`
      : `Facturación inactiva: ${billing.reason}`,
    billing.enabled ? null : billingInstructions()
  );

  const iam = await checkServiceAccountRoles(token, saEmail);
  if (iam.alreadyHadAll) {
    add("iam", "ok", "Todos los roles IAM necesarios están asignados", null);
  } else if (iam.ok) {
    add("iam", "ok", `Roles IAM asignados automáticamente: ${iam.granted.join(", ")}`, null);
  } else {
    add(
      "iam",
      "fail",
      iam.error || `Faltan roles: ${iam.missing.join(", ")}`,
      {
        link: LINKS.iamGrant,
        steps: [
          `Abrir: ${LINKS.iamGrant}`,
          `Principal: ${saEmail}`,
          ...iam.missing.map((r) => `Añadir rol: ${r}`),
          "Guardar y volver a ejecutar npm run wallet:setup",
        ],
        missingRoles: iam.missing,
      }
    );
  }

  const apis = await checkAllApis(token);
  const disabledApis = apis.filter((a) => !a.enabled);
  if (disabledApis.length === 0) {
    add("apis", "ok", `${REQUIRED_APIS.length} APIs habilitadas`, null);
  } else {
    add(
      "apis",
      disabledApis.length === apis.length ? "fail" : "warn",
      `APIs pendientes: ${disabledApis.map((a) => a.service).join(", ")}`,
      {
        link: LINKS.apisDashboard,
        apis: disabledApis.map((a) => ({
          service: a.service,
          link: apiEnableLink(a.service),
        })),
      }
    );
  }

  const oauth = checkOnly
    ? { ok: null, reason: "Omitido en modo solo lectura" }
    : await ensureOAuthConsentBasics(token);
  add(
    "oauth",
    checkOnly ? "warn" : oauth.ok ? "ok" : "warn",
    checkOnly
      ? "OAuth — ejecuta npm run wallet:diagnose (sin dry-run) para verificar"
      : oauth.ok
        ? "Pantalla OAuth / consent configurada"
        : oauth.reason,
    checkOnly || oauth.ok ? null : oauth.manual || { link: LINKS.oauthConsent }
  );

  if (checkOnly) {
    add("auth", "warn", "Auth — omitido en dry-run (usa wallet:diagnose)", {
      link: LINKS.authProviders,
    });
  } else {
    try {
      await configureAuthProviders(token);
      add("auth", "ok", "Authentication email + Google + dominios OK", null);
    } catch (err) {
      add("auth", "fail", err.message, {
        link: LINKS.authProviders,
        steps: ["Verificar Email/Password y Google activos", LINKS.authProviders],
      });
    }
  }

  if (checkOnly) {
    add("firestore", "warn", "Firestore — omitido en dry-run", { link: LINKS.firestore });
  } else {
    try {
      const fs = await ensureFirestoreDatabase(token);
      add(
        "firestore",
        "ok",
        fs.created ? "Firestore creado (nam5)" : `Firestore existente (${fs.location})`,
        null
      );
    } catch (err) {
      add("firestore", "fail", err.message, { link: LINKS.firestore });
    }
  }

  report.canAutoSetup = report.blockers.length === 0;
  return report;
}

export async function autoFixPermissions(credentials) {
  const token = await getAccessToken(credentials);
  const saEmail = credentials.client_email;
  const results = {
    billing: await checkBillingEnabled(token),
    iam: await ensureServiceAccountRoles(token, saEmail),
    apis: await enableApis(token),
    oauth: await ensureOAuthConsentBasics(token),
    auth: null,
    firestore: null,
  };

  try {
    results.auth = await configureAuthProviders(token);
  } catch (err) {
    results.auth = { error: err.message };
  }

  try {
    results.firestore = await ensureFirestoreDatabase(token);
  } catch (err) {
    results.firestore = { error: err.message };
  }

  return results;
}
