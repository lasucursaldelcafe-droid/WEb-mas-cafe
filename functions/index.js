"use strict";

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const crypto = require("crypto");

const DEFAULT_PROGRAM = require("./program-defaults.json");

initializeApp();
const db = getFirestore();

setGlobalOptions({ region: "us-central1", maxInstances: 20 });

function hashPin(pin) {
  return crypto.createHash("sha256").update(String(pin)).digest("hex");
}

function getTier(lifetimePoints, tiers) {
  const list = [...(tiers || DEFAULT_PROGRAM.tiers)].sort((a, b) => b.minPoints - a.minPoints);
  for (const tier of list) {
    if (lifetimePoints >= tier.minPoints) return tier.name;
  }
  return list[list.length - 1]?.name || "Miembro";
}

function calcPoints(amountCop, settings) {
  const min = settings.minPurchaseCop ?? DEFAULT_PROGRAM.minPurchaseCop;
  if (amountCop < min) return 0;
  const rate = settings.pointsPerThousandCop ?? DEFAULT_PROGRAM.pointsPerThousandCop;
  return Math.floor(amountCop / 1000) * rate;
}

function genRedemptionCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function getSettings() {
  const snap = await db.doc("program/settings").get();
  return snap.exists ? snap.data() : null;
}

async function ensureProgram() {
  const ref = db.doc("program/settings");
  const snap = await ref.get();
  if (snap.exists) return snap.data();

  const pin = DEFAULT_PROGRAM.defaultStaffPin || "123456";
  const data = {
    enabled: DEFAULT_PROGRAM.enabled !== false,
    pointsPerThousandCop: DEFAULT_PROGRAM.pointsPerThousandCop,
    minPurchaseCop: DEFAULT_PROGRAM.minPurchaseCop,
    maxPointsPerDay: DEFAULT_PROGRAM.maxPointsPerDay,
    brandName: DEFAULT_PROGRAM.brandName,
    tiers: DEFAULT_PROGRAM.tiers,
    rewards: DEFAULT_PROGRAM.rewards,
    staffPinHash: hashPin(pin),
    initializedAt: FieldValue.serverTimestamp(),
  };
  await ref.set(data);
  return data;
}

async function verifyStaffPin(staffPin) {
  const settings = (await getSettings()) || (await ensureProgram());
  if (!settings.staffPinHash) {
    throw new HttpsError("failed-precondition", "Programa no inicializado");
  }
  if (hashPin(staffPin) !== settings.staffPinHash) {
    throw new HttpsError("permission-denied", "PIN de caja incorrecto");
  }
}

async function getNextMemberId() {
  return db.runTransaction(async (tx) => {
    const ref = db.doc("counters/members");
    const snap = await tx.get(ref);
    const last = snap.exists ? snap.data().last || 0 : 0;
    const next = last + 1;
    tx.set(ref, { last: next }, { merge: true });
    return `MC-${String(next).padStart(6, "0")}`;
  });
}

function ledgerEntry(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type,
    points: data.points,
    balanceAfter: data.balanceAfter,
    reason: data.reason,
    amountCop: data.amountCop ?? null,
    createdAt: data.createdAt?.toMillis?.() ?? null,
  };
}

exports.ensureProgram = onCall(async () => {
  await ensureProgram();
  return { ok: true };
});

exports.getProgramStatus = onCall(async () => {
  const settings = await ensureProgram();
  return {
    enabled: settings.enabled !== false,
    brandName: settings.brandName || DEFAULT_PROGRAM.brandName,
    pointsPerThousandCop: settings.pointsPerThousandCop,
    minPurchaseCop: settings.minPurchaseCop,
    maxPointsPerDay: settings.maxPointsPerDay,
    rewards: (settings.rewards || []).filter((r) => r.active).map((r) => ({
      id: r.id,
      name: r.name,
      pointsCost: r.pointsCost,
    })),
  };
});

exports.ensureCustomerProfile = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Inicia sesión primero");

  const uid = request.auth.uid;
  const custRef = db.doc(`customers/${uid}`);
  const walletRef = db.doc(`wallets/${uid}`);
  const [custSnap, walletSnap] = await Promise.all([custRef.get(), walletRef.get()]);

  if (custSnap.exists && walletSnap.exists) {
    return { memberId: custSnap.data().memberId, isNew: false };
  }

  await ensureProgram();
  const memberId = await getNextMemberId();
  const email = (request.auth.token.email || "").toLowerCase();
  const displayName =
    request.data?.displayName ||
    request.auth.token.name ||
    (email ? email.split("@")[0] : "Cliente");

  const batch = db.batch();
  if (!custSnap.exists) {
    batch.set(custRef, {
      memberId,
      displayName,
      email,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  if (!walletSnap.exists) {
    batch.set(walletRef, {
      points: 0,
      lifetimePoints: 0,
      tier: getTier(0, DEFAULT_PROGRAM.tiers),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  return { memberId, isNew: true };
});

exports.getMyWallet = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Inicia sesión primero");

  const uid = request.auth.uid;
  await ensureProgram();
  const settings = (await getSettings()) || DEFAULT_PROGRAM;

  const [custSnap, walletSnap] = await Promise.all([
    db.doc(`customers/${uid}`).get(),
    db.doc(`wallets/${uid}`).get(),
  ]);

  if (!custSnap.exists) {
    throw new HttpsError("not-found", "Perfil no encontrado. Cierra sesión e ingresa de nuevo.");
  }

  const walletData = walletSnap.exists
    ? walletSnap.data()
    : { points: 0, lifetimePoints: 0, tier: getTier(0, settings.tiers) };

  const ledgerSnap = await db
    .collection("ledger")
    .where("customerId", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(40)
    .get();

  const pendingSnap = await db
    .collection("redemptions")
    .where("customerId", "==", uid)
    .where("status", "==", "pending")
    .get();

  const rewards = (settings.rewards || DEFAULT_PROGRAM.rewards).filter((r) => r.active);
  const affordable = rewards.filter((r) => r.pointsCost <= walletData.points);
  const nextReward =
    rewards.find((r) => r.pointsCost > walletData.points) ||
    rewards[rewards.length - 1] ||
    null;

  return {
    customer: {
      memberId: custSnap.data().memberId,
      displayName: custSnap.data().displayName,
      email: custSnap.data().email,
    },
    wallet: {
      points: walletData.points || 0,
      lifetimePoints: walletData.lifetimePoints || 0,
      tier: walletData.tier || getTier(walletData.lifetimePoints || 0, settings.tiers),
    },
    ledger: ledgerSnap.docs.map(ledgerEntry),
    pendingRedemptions: pendingSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        code: data.code,
        rewardName: data.rewardName,
        expiresAt: data.expiresAt?.toMillis?.() ?? null,
      };
    }),
    rewards,
    affordableRewardIds: affordable.map((r) => r.id),
    nextReward: nextReward
      ? {
          name: nextReward.name,
          pointsNeeded: Math.max(0, nextReward.pointsCost - (walletData.points || 0)),
        }
      : null,
    program: {
      pointsPerThousandCop: settings.pointsPerThousandCop,
      minPurchaseCop: settings.minPurchaseCop,
      brandName: settings.brandName,
    },
  };
});

exports.registerPurchase = onCall(async (request) => {
  const { staffPin, memberId, amountCop, note } = request.data || {};
  await verifyStaffPin(staffPin);
  const settings = (await getSettings()) || (await ensureProgram());

  const normalizedId = String(memberId || "")
    .trim()
    .toUpperCase();
  const amount = Number(amountCop);

  if (!normalizedId || !Number.isFinite(amount) || amount <= 0) {
    throw new HttpsError("invalid-argument", "ID de miembro y monto válidos son obligatorios");
  }

  const custSnap = await db
    .collection("customers")
    .where("memberId", "==", normalizedId)
    .limit(1)
    .get();
  if (custSnap.empty) throw new HttpsError("not-found", "Cliente no encontrado");

  const custDoc = custSnap.docs[0];
  const uid = custDoc.id;
  let points = calcPoints(amount, settings);

  if (points <= 0) {
    throw new HttpsError(
      "failed-precondition",
      `Compra mínima $${(settings.minPurchaseCop || 0).toLocaleString("es-CO")} para sumar puntos`
    );
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayLedger = await db
    .collection("ledger")
    .where("customerId", "==", uid)
    .where("type", "==", "earn")
    .where("createdAt", ">=", Timestamp.fromDate(startOfDay))
    .get();

  const earnedToday = todayLedger.docs.reduce((sum, doc) => sum + (doc.data().points || 0), 0);
  const maxDaily = settings.maxPointsPerDay || DEFAULT_PROGRAM.maxPointsPerDay;
  points = Math.min(points, Math.max(0, maxDaily - earnedToday));

  if (points <= 0) {
    throw new HttpsError("resource-exhausted", `Límite diario de ${maxDaily} puntos alcanzado`);
  }

  const walletRef = db.doc(`wallets/${uid}`);

  return db.runTransaction(async (tx) => {
    const walletSnap = await tx.get(walletRef);
    const current = walletSnap.exists ? walletSnap.data().points || 0 : 0;
    const lifetime = walletSnap.exists ? walletSnap.data().lifetimePoints || 0 : 0;
    const newBalance = current + points;
    const newLifetime = lifetime + points;
    const tier = getTier(newLifetime, settings.tiers);

    tx.set(
      walletRef,
      {
        points: newBalance,
        lifetimePoints: newLifetime,
        tier,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    tx.set(db.collection("ledger").doc(), {
      customerId: uid,
      memberId: normalizedId,
      type: "earn",
      points,
      balanceAfter: newBalance,
      amountCop: amount,
      reason: note || "Compra en mostrador",
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      memberId: normalizedId,
      displayName: custDoc.data().displayName,
      pointsAdded: points,
      newBalance,
      tier,
      amountCop: amount,
    };
  });
});

exports.lookupCustomer = onCall(async (request) => {
  const { staffPin, query } = request.data || {};
  await verifyStaffPin(staffPin);

  const q = String(query || "").trim();
  if (!q) throw new HttpsError("invalid-argument", "Busca por ID de miembro o correo");

  let snap;
  if (q.includes("@")) {
    snap = await db.collection("customers").where("email", "==", q.toLowerCase()).limit(1).get();
  } else {
    snap = await db
      .collection("customers")
      .where("memberId", "==", q.toUpperCase())
      .limit(1)
      .get();
  }

  if (snap.empty) throw new HttpsError("not-found", "Cliente no encontrado");

  const cust = snap.docs[0];
  const wallet = await db.doc(`wallets/${cust.id}`).get();

  return {
    uid: cust.id,
    memberId: cust.data().memberId,
    displayName: cust.data().displayName,
    email: cust.data().email,
    wallet: wallet.exists ? wallet.data() : { points: 0, tier: "Amante del café" },
  };
});

exports.redeemReward = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Inicia sesión primero");

  const { rewardId } = request.data || {};
  const uid = request.auth.uid;
  const settings = (await getSettings()) || (await ensureProgram());

  const reward = (settings.rewards || DEFAULT_PROGRAM.rewards).find(
    (r) => r.id === rewardId && r.active
  );
  if (!reward) throw new HttpsError("not-found", "Premio no disponible");

  const walletRef = db.doc(`wallets/${uid}`);
  const custRef = db.doc(`customers/${uid}`);

  return db.runTransaction(async (tx) => {
    const [walletSnap, custSnap] = await Promise.all([tx.get(walletRef), tx.get(custRef)]);
    if (!walletSnap.exists || !custSnap.exists) {
      throw new HttpsError("not-found", "Wallet no encontrada");
    }

    const balance = walletSnap.data().points || 0;
    if (balance < reward.pointsCost) {
      throw new HttpsError(
        "failed-precondition",
        `Necesitas ${reward.pointsCost} puntos (tienes ${balance})`
      );
    }

    const newBalance = balance - reward.pointsCost;
    const code = genRedemptionCode();

    tx.update(walletRef, {
      points: newBalance,
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.set(db.collection("ledger").doc(), {
      customerId: uid,
      memberId: custSnap.data().memberId,
      type: "redeem",
      points: -reward.pointsCost,
      balanceAfter: newBalance,
      reason: `Canje: ${reward.name}`,
      rewardId: reward.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    const redemptionRef = db.collection("redemptions").doc();
    tx.set(redemptionRef, {
      customerId: uid,
      memberId: custSnap.data().memberId,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsCost: reward.pointsCost,
      code,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 30 * 60 * 1000),
    });

    return {
      code,
      rewardName: reward.name,
      newBalance,
      expiresInMinutes: 30,
    };
  });
});

exports.confirmRedemption = onCall(async (request) => {
  const { staffPin, code } = request.data || {};
  await verifyStaffPin(staffPin);

  const normalizedCode = String(code || "")
    .trim()
    .toUpperCase();
  if (!normalizedCode) throw new HttpsError("invalid-argument", "Ingresa el código de canje");

  const snap = await db
    .collection("redemptions")
    .where("code", "==", normalizedCode)
    .where("status", "==", "pending")
    .limit(1)
    .get();

  if (snap.empty) throw new HttpsError("not-found", "Código inválido o ya utilizado");

  const doc = snap.docs[0];
  const data = doc.data();

  if (data.expiresAt && data.expiresAt.toMillis() < Date.now()) {
    await doc.ref.update({ status: "expired" });
    throw new HttpsError("deadline-exceeded", "El código expiró. El cliente debe generar uno nuevo.");
  }

  await doc.ref.update({
    status: "confirmed",
    confirmedAt: FieldValue.serverTimestamp(),
  });

  const cust = await db.doc(`customers/${data.customerId}`).get();

  return {
    rewardName: data.rewardName,
    memberId: data.memberId,
    displayName: cust.data()?.displayName || "",
    pointsCost: data.pointsCost,
  };
});

exports.verifyStaffPinOnly = onCall(async (request) => {
  const { staffPin } = request.data || {};
  await verifyStaffPin(staffPin);
  await ensureProgram();
  return { ok: true };
});

exports.updateStaffPin = onCall(async (request) => {
  const { currentPin, newPin } = request.data || {};
  await verifyStaffPin(currentPin);

  if (!newPin || String(newPin).length < 4) {
    throw new HttpsError("invalid-argument", "El PIN nuevo debe tener al menos 4 dígitos");
  }

  await db.doc("program/settings").update({
    staffPinHash: hashPin(newPin),
    pinUpdatedAt: FieldValue.serverTimestamp(),
  });

  return { ok: true };
});
