/**
 * Cliente HTTP para la Edge Function wallet (Supabase).
 */

export function walletConfigured() {
  return Boolean(window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
}

export function walletConfigError() {
  if (walletConfigured()) return null;
  return "Backend no configurado. Añade SUPABASE_URL y SUPABASE_ANON_KEY en GitHub Secrets y vuelve a publicar.";
}

export async function walletCall(action, payload = {}, accessToken = null) {
  if (!walletConfigured()) {
    throw new Error(walletConfigError());
  }

  const headers = {
    "Content-Type": "application/json",
    apikey: window.SUPABASE_ANON_KEY,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${window.SUPABASE_URL}/functions/v1/wallet`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...payload }),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = { error: `HTTP ${res.status}` };
  }

  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status}`);
  }

  return data;
}
