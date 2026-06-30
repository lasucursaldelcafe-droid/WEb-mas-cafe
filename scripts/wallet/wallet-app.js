import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-functions.js";

const config = window.FIREBASE_CONFIG;
const REGION = window.FIREBASE_FUNCTIONS_REGION || "us-central1";

const app = initializeApp(config);
const auth = getAuth(app);
const functions = getFunctions(app, REGION);

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  try { connectFunctionsEmulator(functions, "localhost", 5001); } catch (_) { /* noop */ }
}

const callEnsureProgram = httpsCallable(functions, "ensureProgram");
const callEnsureProfile = httpsCallable(functions, "ensureCustomerProfile");
const callGetWallet = httpsCallable(functions, "getMyWallet");
const callRedeem = httpsCallable(functions, "redeemReward");
const callProgram = httpsCallable(functions, "getProgramStatus");

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const views = {
  auth: $("#view-auth"),
  app: $("#view-app"),
};
const tabs = $$(".tab");
const panels = $$("[data-panel]");

let walletData = null;

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

async function loadWallet() {
  const res = await callGetWallet();
  walletData = res.data;
  renderWallet();
}

function renderWallet() {
  if (!walletData) return;
  const { customer, wallet, nextReward, program } = walletData;

  $("#member-name").textContent = customer.displayName;
  $("#member-id").textContent = customer.memberId;
  $("#member-tier").textContent = wallet.tier;
  $("#member-email").textContent = customer.email || "";
  const idCopy = $("#member-id-copy");
  if (idCopy) idCopy.textContent = customer.memberId;
  $("#points-balance").innerHTML = `${wallet.points} <small>pts</small>`;

  const target = nextReward
    ? wallet.points + nextReward.pointsNeeded
    : wallet.points || 1;
  const pct = nextReward
    ? Math.min(100, Math.round((wallet.points / target) * 100))
    : 100;
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
    }
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
    const res = await callRedeem({ rewardId });
    showMsg(
      msg,
      `Canje listo. Muestra este código en caja: ${res.data.code} (válido 30 min)`,
      "ok"
    );
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

async function handleAuth(mode) {
  const msg = $("#auth-msg");
  hideMsg(msg);
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
    await callEnsureProgram();
    if (mode === "register") {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
      await callEnsureProfile({ displayName: name || undefined });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      await callEnsureProfile({});
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
  setLoading($("#btn-google"), true);
  try {
    await callEnsureProgram();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    await callEnsureProfile({});
  } catch (err) {
    showMsg(msg, translateAuthError(err), "error");
  } finally {
    setLoading($("#btn-google"), false);
  }
}

function translateAuthError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "Este correo ya está registrado. Inicia sesión.";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Correo o contraseña incorrectos.";
  if (code.includes("weak-password")) return "La contraseña debe tener al menos 6 caracteres.";
  return err.message || "Error de autenticación";
}

$("#btn-login")?.addEventListener("click", () => handleAuth("login"));
$("#btn-register")?.addEventListener("click", () => handleAuth("register"));
$("#btn-google")?.addEventListener("click", handleGoogle);
$("#btn-logout")?.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    views.auth?.classList.remove("hidden");
    views.app?.classList.add("hidden");
    $("#btn-logout")?.classList.add("hidden");
    walletData = null;
    return;
  }

  views.auth?.classList.add("hidden");
  views.app?.classList.remove("hidden");
  $("#btn-logout")?.classList.remove("hidden");

  try {
    await callEnsureProfile({});
    await loadWallet();
    const prog = await callProgram();
    $("#program-hint").textContent =
      `Ganas ${prog.data.pointsPerThousandCop} punto(s) por cada $1.000 · mínimo ${formatCop(prog.data.minPurchaseCop)}`;
  } catch (err) {
    showMsg($("#app-msg"), err.message || "Error cargando wallet", "error");
  }
});

activateTab("tarjeta");
