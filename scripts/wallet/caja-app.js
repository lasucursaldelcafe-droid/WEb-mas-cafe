import { walletCall, walletConfigured, walletConfigError } from "../wallet/wallet-api.mjs";

const PIN_KEY = "mas-cafe-staff-pin";

const $ = (sel, root = document) => root.querySelector(sel);

function getPin() {
  return sessionStorage.getItem(PIN_KEY) || "";
}

function setPin(pin) {
  sessionStorage.setItem(PIN_KEY, pin);
}

function formatCop(n) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function showMsg(el, text, type = "error") {
  el.textContent = text;
  el.className = `msg msg-${type}`;
  el.classList.remove("hidden");
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset.label = btn.dataset.label || btn.textContent;
  btn.textContent = loading ? "Procesando…" : btn.dataset.label;
}

function showApp() {
  $("#pin-gate")?.classList.add("hidden");
  $("#caja-app")?.classList.remove("hidden");
}

function showPinGate() {
  $("#pin-gate")?.classList.remove("hidden");
  $("#caja-app")?.classList.add("hidden");
}

async function api(action, payload = {}) {
  return walletCall(action, payload);
}

async function initProgramHint() {
  if (!walletConfigured()) {
    $("#program-rules").textContent = walletConfigError();
    return;
  }
  try {
    await api("ensureProgram");
    const p = await api("getProgramStatus");
    $("#program-rules").textContent =
      `${p.pointsPerThousandCop} pt / $1.000 · mínimo ${formatCop(p.minPurchaseCop)} · máx. ${p.maxPointsPerDay} pts/día`;
  } catch (_) {
    $("#program-rules").textContent = "Conectando con el programa…";
  }
}

$("#btn-unlock")?.addEventListener("click", async () => {
  const pin = $("#staff-pin").value.trim();
  const msg = $("#pin-msg");
  if (!pin) {
    showMsg(msg, "Ingresa el PIN de caja", "error");
    return;
  }
  if (!walletConfigured()) {
    showMsg(msg, walletConfigError(), "error");
    return;
  }
  setLoading($("#btn-unlock"), true);
  try {
    await api("verifyStaffPinOnly", { staffPin: pin });
    setPin(pin);
    showApp();
    $("#btn-lock")?.classList.remove("hidden");
    msg.classList.add("hidden");
  } catch (err) {
    showMsg(msg, err.message || "PIN incorrecto", "error");
  } finally {
    setLoading($("#btn-unlock"), false);
  }
});

$("#btn-lock")?.addEventListener("click", () => {
  sessionStorage.removeItem(PIN_KEY);
  showPinGate();
  $("#staff-pin").value = "";
});

$("#btn-search")?.addEventListener("click", async () => {
  const query = $("#search-query").value.trim();
  const msg = $("#search-msg");
  const result = $("#search-result");
  if (!query) {
    showMsg(msg, "Busca por ID (MC-…) o correo", "error");
    return;
  }
  setLoading($("#btn-search"), true);
  msg.classList.add("hidden");
  try {
    const c = await api("lookupCustomer", { staffPin: getPin(), query });
    result.innerHTML = `
      <div class="result-box">
        <strong>${c.displayName}</strong><br/>
        ID: ${c.memberId}<br/>
        Saldo: <strong>${c.wallet?.points ?? 0} pts</strong> · ${c.wallet?.tier ?? ""}
      </div>`;
    result.dataset.memberId = c.memberId;
    $("#purchase-member").value = c.memberId;
  } catch (err) {
    result.innerHTML = "";
    showMsg(msg, err.message || "No encontrado", "error");
  } finally {
    setLoading($("#btn-search"), false);
  }
});

$("#btn-add-points")?.addEventListener("click", async () => {
  const memberId = $("#purchase-member").value.trim();
  const amountCop = Number($("#purchase-amount").value);
  const note = $("#purchase-note").value.trim();
  const msg = $("#purchase-msg");
  const result = $("#purchase-result");

  if (!memberId || !amountCop) {
    showMsg(msg, "ID de miembro y monto son obligatorios", "error");
    return;
  }

  setLoading($("#btn-add-points"), true);
  msg.classList.add("hidden");
  try {
    const d = await api("registerPurchase", {
      staffPin: getPin(),
      memberId,
      amountCop,
      note: note || undefined,
    });
    result.innerHTML = `
      <div class="result-box">
        <strong>+${d.pointsAdded} puntos</strong> a ${d.displayName}<br/>
        Compra: ${formatCop(d.amountCop)} · Nuevo saldo: <strong>${d.newBalance} pts</strong><br/>
        Nivel: ${d.tier}
      </div>`;
    showMsg(msg, "Puntos acreditados automáticamente", "ok");
    $("#purchase-amount").value = "";
  } catch (err) {
    result.innerHTML = "";
    showMsg(msg, err.message || "Error al registrar compra", "error");
  } finally {
    setLoading($("#btn-add-points"), false);
  }
});

$("#btn-confirm-code")?.addEventListener("click", async () => {
  const code = $("#redeem-code").value.trim();
  const msg = $("#redeem-msg");
  const result = $("#redeem-result");
  if (!code) {
    showMsg(msg, "Ingresa el código del cliente", "error");
    return;
  }
  setLoading($("#btn-confirm-code"), true);
  msg.classList.add("hidden");
  try {
    const d = await api("confirmRedemption", { staffPin: getPin(), code });
    result.innerHTML = `
      <div class="result-box">
        Canje confirmado: <strong>${d.rewardName}</strong><br/>
        Cliente: ${d.displayName} (${d.memberId})
      </div>`;
    showMsg(msg, "Canje validado correctamente", "ok");
    $("#redeem-code").value = "";
  } catch (err) {
    result.innerHTML = "";
    showMsg(msg, err.message || "Código inválido", "error");
  } finally {
    setLoading($("#btn-confirm-code"), false);
  }
});

if (getPin()) {
  showApp();
} else {
  showPinGate();
}

initProgramHint();
