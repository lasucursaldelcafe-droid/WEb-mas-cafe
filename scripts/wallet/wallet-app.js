import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm";
import { walletCall, walletConfigured, walletConfigError } from "./wallet-api.mjs";

const supabase = walletConfigured()
  ? createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
  : null;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const views = {
  auth: $("#view-auth"),
  app: $("#view-app"),
};
const tabs = $$(".tab");
const panels = $$("[data-panel]");

let walletData = null;
let accessToken = null;

function showMsg(el, text, type = "error") {
  if (!el) return;
  el.textContent = text;
  el.className = `msg msg-${type}`;
  el.classList.remove("hidden");
}

function hideMsg(el) {
  el?.classList.add("hidden");
}

function formatCop(n) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(ms) {
  if (!ms) return "";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset.label = btn.dataset.label || btn.textContent;
  btn.textContent = loading ? "Espera…" : btn.dataset.label;
}

async function api(action, payload = {}) {
  return walletCall(action, payload, accessToken);
}

async function loadWallet() {
  walletData = await api("getMyWallet");
  renderWallet();
}

function renderWallet() {
  if (!walletData) return;
  const { customer, wallet, nextReward } = walletData;

  $("#member-name").textContent = customer.displayName;
  $("#member-id").textContent = customer.memberId;
  $("#member-tier").textContent = wallet.tier;
  $("#member-email").textContent = customer.email || "";
  const idCopy = $("#member-id-copy");
  if (idCopy) idCopy.textContent = customer.memberId;
  $("#points-balance").innerHTML = `${wallet.points} <small>pts</small>`;

  const target = nextReward ? wallet.points + nextReward.pointsNeeded : wallet.points || 1;
  const pct = nextReward ? Math.min(100, Math.round((wallet.points / target) * 100)) : 100;
  $("#progress-label").textContent = nextReward
    ? `Próximo: ${nextReward.name} · faltan ${nextReward.pointsNeeded} pts`
    : "¡Puedes canjear premios!";
  $("#progress-fill").style.width = `${pct}%`;

  renderQr(customer.memberId);
  renderLedger();
  renderRewards();
  renderPending();
}

function renderQr(memberId) {
  const box = $("#qr-box");
  if (!box || !window.QRCode) return;
  box.innerHTML = "";
  window.QRCode.toCanvas(
    memberId,
    { width: 160, margin: 1, color: { dark: "#073954", light: "#ffffff" } },
    (err, canvas) => {
      if (!err && canvas) box.appendChild(canvas);
    },
  );
}

function renderLedger() {
  const list = $("#ledger-list");
  if (!list) return;
  const items = walletData.ledger || [];
  if (!items.length) {
    list.innerHTML = `<p style="font-size:.85rem;color:var(--muted)">Aún no hay movimientos.</p>`;
    return;
  }
  list.innerHTML = items
    .map((item) => {
      const cls = item.points >= 0 ? "pos" : "neg";
      const sign = item.points >= 0 ? "+" : "";
      return `<div class="ledger-item">
        <div>
          <div>${item.reason}</div>
          <div class="when">${formatDate(item.createdAt)}${item.amountCop ? ` · ${formatCop(item.amountCop)}` : ""}</div>
        </div>
        <div class="pts ${cls}">${sign}${item.points}</div>
      </div>`;
    })
    .join("");
}

function renderRewards() {
  const list = $("#rewards-list");
  if (!list) return;
  const { rewards, wallet, affordableRewardIds } = walletData;
  list.innerHTML = (rewards || [])
    .map((r) => {
      const can = affordableRewardIds?.includes(r.id);
      return `<div class="reward ${can ? "can" : ""}">
        <div>
          <div class="reward-name">${r.name}</div>
          <div class="reward-cost">${r.pointsCost} puntos</div>
        </div>
        <button type="button" class="btn btn-primary" data-reward="${r.id}" ${can ? "" : "disabled"}>
          Canjear
        </button>
      </div>`;
    })
    .join("");

  $$("[data-reward]", list).forEach((btn) => {
    btn.addEventListener("click", () => redeem(btn.dataset.reward, btn));
  });
}

function renderPending() {
  const box = $("#pending-box");
  const pending = walletData.pendingRedemptions || [];
  if (!pending.length) {
    box?.classList.add("hidden");
    return;
  }
  box?.classList.remove("hidden");
  const p = pending[0];
  $("#pending-code").textContent = p.code;
  $("#pending-reward").textContent = p.rewardName;
}

async function redeem(rewardId, btn) {
  setLoading(btn, true);
  const msg = $("#redeem-msg");
  hideMsg(msg);
  try {
    const res = await api("redeemReward", { rewardId });
    showMsg(msg, `Canje listo. Muestra este código en caja: ${res.code} (válido 30 min)`, "ok");
    await loadWallet();
    activateTab("canje");
  } catch (err) {
    showMsg(msg, err.message || "No se pudo canjear", "error");
  } finally {
    setLoading(btn, false);
  }
}

function activateTab(id) {
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
  panels.forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== id));
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
});

function translateAuthError(err) {
  const msg = err?.message || "";
  if (msg.includes("already registered") || msg.includes("User already registered")) {
    return "Este correo ya está registrado. Inicia sesión.";
  }
  if (msg.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (msg.includes("Password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  return msg || "Error de autenticación";
}

async function handleAuth(mode) {
  const msg = $("#auth-msg");
  hideMsg(msg);

  if (!supabase) {
    showMsg(msg, walletConfigError(), "error");
    return;
  }

  const email = $("#auth-email").value.trim();
  const password = $("#auth-password").value;
  const name = $("#auth-name")?.value.trim();

  if (!email || !password) {
    showMsg(msg, "Correo y contraseña son obligatorios", "error");
    return;
  }

  const btn = mode === "register" ? $("#btn-register") : $("#btn-login");
  setLoading(btn, true);

  try {
    await api("ensureProgram");
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name || undefined } },
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
  } catch (err) {
    showMsg(msg, translateAuthError(err), "error");
  } finally {
    setLoading(btn, false);
  }
}

async function handleGoogle() {
  const msg = $("#auth-msg");
  hideMsg(msg);

  if (!supabase) {
    showMsg(msg, walletConfigError(), "error");
    return;
  }

  setLoading($("#btn-google"), true);
  try {
    await api("ensureProgram");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href.split("#")[0] },
    });
    if (error) throw error;
  } catch (err) {
    showMsg(msg, translateAuthError(err), "error");
    setLoading($("#btn-google"), false);
  }
}

$("#btn-login")?.addEventListener("click", () => handleAuth("login"));
$("#btn-register")?.addEventListener("click", () => handleAuth("register"));
$("#btn-google")?.addEventListener("click", handleGoogle);
$("#btn-logout")?.addEventListener("click", async () => {
  await supabase?.auth.signOut();
});

async function onSession(session) {
  if (!session) {
    accessToken = null;
    views.auth?.classList.remove("hidden");
    views.app?.classList.add("hidden");
    $("#btn-logout")?.classList.add("hidden");
    walletData = null;
    return;
  }

  accessToken = session.access_token;
  views.auth?.classList.add("hidden");
  views.app?.classList.remove("hidden");
  $("#btn-logout")?.classList.remove("hidden");

  try {
    const name =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      undefined;
    await api("ensureCustomerProfile", { displayName: name });
    await loadWallet();
    const prog = await api("getProgramStatus");
    $("#program-hint").textContent =
      `Ganas ${prog.pointsPerThousandCop} punto(s) por cada $1.000 · mínimo ${formatCop(prog.minPurchaseCop)}`;
  } catch (err) {
    showMsg($("#app-msg"), err.message || "Error cargando wallet", "error");
  }
}

if (!walletConfigured()) {
  showMsg($("#auth-msg"), walletConfigError(), "error");
} else if (supabase) {
  supabase.auth.getSession().then(({ data: { session } }) => onSession(session));
  supabase.auth.onAuthStateChange((_event, session) => onSession(session));
}

activateTab("tarjeta");
