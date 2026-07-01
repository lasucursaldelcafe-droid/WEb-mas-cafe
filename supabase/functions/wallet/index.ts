import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  createSaveUrl,
  googleWalletConfigured,
  patchLoyaltyPoints,
} from "./google-wallet.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_PROGRAM = {
  enabled: true,
  pointsPerThousandCop: 1,
  minPurchaseCop: 15000,
  maxPointsPerDay: 500,
  brandName: "Más Café",
  defaultStaffPin: "123456",
  tiers: [
    { name: "Amante del café", minPoints: 0 },
    { name: "Conocedor", minPoints: 200 },
    { name: "Maestro tostador", minPoints: 500 },
  ],
  rewards: [
    { id: "cafe-filtro", name: "Café filtro gratis", pointsCost: 100, active: true },
    { id: "descuento-5k", name: "$5.000 de descuento", pointsCost: 50, active: true },
    { id: "postre", name: "Postre de la casa", pointsCost: 150, active: true },
  ],
};

type ProgramSettings = {
  enabled: boolean;
  points_per_thousand_cop: number;
  min_purchase_cop: number;
  max_points_per_day: number;
  brand_name: string;
  tiers: Array<{ name: string; minPoints: number }>;
  rewards: Array<{ id: string; name: string; pointsCost: number; active: boolean }>;
  staff_pin_hash: string | null;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

async function hashPin(pin: string) {
  const data = new TextEncoder().encode(String(pin));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getTier(lifetimePoints: number, tiers: ProgramSettings["tiers"]) {
  const list = [...(tiers || DEFAULT_PROGRAM.tiers)].sort(
    (a, b) => b.minPoints - a.minPoints,
  );
  for (const tier of list) {
    if (lifetimePoints >= tier.minPoints) return tier.name;
  }
  return list[list.length - 1]?.name || "Miembro";
}

function calcPoints(amountCop: number, settings: ProgramSettings) {
  if (amountCop < settings.min_purchase_cop) return 0;
  return Math.floor(amountCop / 1000) * settings.points_per_thousand_cop;
}

function genRedemptionCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase no configurado en el servidor");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getSettings(db: SupabaseClient): Promise<ProgramSettings | null> {
  const { data } = await db.from("program_settings").select("*").eq("id", 1).maybeSingle();
  return data as ProgramSettings | null;
}

async function ensureProgram(db: SupabaseClient) {
  const existing = await getSettings(db);
  if (existing?.staff_pin_hash) return existing;

  const pin = DEFAULT_PROGRAM.defaultStaffPin;
  const payload = {
    id: 1,
    enabled: DEFAULT_PROGRAM.enabled,
    points_per_thousand_cop: DEFAULT_PROGRAM.pointsPerThousandCop,
    min_purchase_cop: DEFAULT_PROGRAM.minPurchaseCop,
    max_points_per_day: DEFAULT_PROGRAM.maxPointsPerDay,
    brand_name: DEFAULT_PROGRAM.brandName,
    tiers: DEFAULT_PROGRAM.tiers,
    rewards: DEFAULT_PROGRAM.rewards,
    staff_pin_hash: await hashPin(pin),
    initialized_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from("program_settings")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as ProgramSettings;
}

async function verifyStaffPin(db: SupabaseClient, staffPin: string) {
  const settings = (await getSettings(db)) || (await ensureProgram(db));
  if (!settings.staff_pin_hash) throw new Error("Programa no inicializado");
  if ((await hashPin(staffPin)) !== settings.staff_pin_hash) {
    throw new Error("PIN de caja incorrecto");
  }
}

async function getNextMemberId(db: SupabaseClient) {
  const { data: counter, error: readErr } = await db
    .from("member_counter")
    .select("last_number")
    .eq("id", 1)
    .single();

  if (readErr) throw new Error(readErr.message);
  const next = (counter?.last_number || 0) + 1;

  const { error: writeErr } = await db
    .from("member_counter")
    .update({ last_number: next })
    .eq("id", 1);

  if (writeErr) throw new Error(writeErr.message);
  return `MC-${String(next).padStart(6, "0")}`;
}

async function getUserFromRequest(req: Request, db: SupabaseClient) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

function mapProgramPublic(settings: ProgramSettings) {
  return {
    enabled: settings.enabled !== false,
    brandName: settings.brand_name || DEFAULT_PROGRAM.brandName,
    pointsPerThousandCop: settings.points_per_thousand_cop,
    minPurchaseCop: settings.min_purchase_cop,
    maxPointsPerDay: settings.max_points_per_day,
    rewards: (settings.rewards || [])
      .filter((r) => r.active)
      .map((r) => ({ id: r.id, name: r.name, pointsCost: r.pointsCost })),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return fail("Método no permitido", 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("JSON inválido");
  }

  const action = String(body.action || "");
  const db = adminClient();

  try {
    switch (action) {
      case "ensureProgram": {
        await ensureProgram(db);
        return json({ ok: true });
      }

      case "getProgramStatus": {
        const settings = await ensureProgram(db);
        return json(mapProgramPublic(settings));
      }

      case "ensureCustomerProfile": {
        const user = await getUserFromRequest(req, db);
        if (!user) return fail("Inicia sesión primero", 401);

        const { data: existing } = await db
          .from("customers")
          .select("member_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existing?.member_id) {
          return json({ memberId: existing.member_id, isNew: false });
        }

        await ensureProgram(db);
        const memberId = await getNextMemberId(db);
        const email = (user.email || "").toLowerCase();
        const displayName =
          String(body.displayName || "") ||
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          (email ? email.split("@")[0] : "Cliente");

        const { error: custErr } = await db.from("customers").insert({
          user_id: user.id,
          member_id: memberId,
          display_name: displayName,
          email,
        });
        if (custErr) throw new Error(custErr.message);

        const { error: walletErr } = await db.from("wallets").insert({
          user_id: user.id,
          points: 0,
          lifetime_points: 0,
          tier: getTier(0, DEFAULT_PROGRAM.tiers),
        });
        if (walletErr) throw new Error(walletErr.message);

        return json({ memberId, isNew: true });
      }

      case "getMyWallet": {
        const user = await getUserFromRequest(req, db);
        if (!user) return fail("Inicia sesión primero", 401);

        const settings = (await getSettings(db)) || (await ensureProgram(db));

        const { data: customer, error: custErr } = await db
          .from("customers")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (custErr || !customer) {
          return fail("Perfil no encontrado. Cierra sesión e ingresa de nuevo.", 404);
        }

        const { data: walletRow } = await db
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        const walletData = walletRow || {
          points: 0,
          lifetime_points: 0,
          tier: getTier(0, settings.tiers),
        };

        const { data: ledgerRows } = await db
          .from("ledger")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(40);

        const { data: pendingRows } = await db
          .from("redemptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "pending");

        const rewards = (settings.rewards || DEFAULT_PROGRAM.rewards).filter((r) => r.active);
        const balance = walletData.points || 0;
        const affordable = rewards.filter((r) => r.pointsCost <= balance);
        const nextReward =
          rewards.find((r) => r.pointsCost > balance) || rewards[rewards.length - 1] || null;

        return json({
          customer: {
            memberId: customer.member_id,
            displayName: customer.display_name,
            email: customer.email,
          },
          wallet: {
            points: balance,
            lifetimePoints: walletData.lifetime_points || 0,
            tier: walletData.tier || getTier(walletData.lifetime_points || 0, settings.tiers),
          },
          ledger: (ledgerRows || []).map((row) => ({
            id: row.id,
            type: row.type,
            points: row.points,
            balanceAfter: row.balance_after,
            reason: row.reason,
            amountCop: row.amount_cop,
            createdAt: row.created_at ? Date.parse(row.created_at) : null,
          })),
          pendingRedemptions: (pendingRows || []).map((row) => ({
            id: row.id,
            code: row.code,
            rewardName: row.reward_name,
            expiresAt: row.expires_at ? Date.parse(row.expires_at) : null,
          })),
          rewards,
          affordableRewardIds: affordable.map((r) => r.id),
          nextReward: nextReward
            ? {
                name: nextReward.name,
                pointsNeeded: Math.max(0, nextReward.pointsCost - balance),
              }
            : null,
          program: {
            pointsPerThousandCop: settings.points_per_thousand_cop,
            minPurchaseCop: settings.min_purchase_cop,
            brandName: settings.brand_name,
          },
        });
      }

      case "registerPurchase": {
        const staffPin = String(body.staffPin || "");
        await verifyStaffPin(db, staffPin);
        const settings = (await getSettings(db)) || (await ensureProgram(db));

        const normalizedId = String(body.memberId || "")
          .trim()
          .toUpperCase();
        const amount = Number(body.amountCop);
        const note = String(body.note || "");

        if (!normalizedId || !Number.isFinite(amount) || amount <= 0) {
          return fail("ID de miembro y monto válidos son obligatorios");
        }

        const { data: cust, error: findErr } = await db
          .from("customers")
          .select("*")
          .eq("member_id", normalizedId)
          .maybeSingle();
        if (findErr || !cust) return fail("Cliente no encontrado", 404);

        let points = calcPoints(amount, settings);
        if (points <= 0) {
          return fail(
            `Compra mínima $${settings.min_purchase_cop.toLocaleString("es-CO")} para sumar puntos`,
            412,
          );
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const { data: todayRows } = await db
          .from("ledger")
          .select("points")
          .eq("user_id", cust.user_id)
          .eq("type", "earn")
          .gte("created_at", startOfDay.toISOString());

        const earnedToday = (todayRows || []).reduce((sum, row) => sum + (row.points || 0), 0);
        const maxDaily = settings.max_points_per_day || DEFAULT_PROGRAM.maxPointsPerDay;
        points = Math.min(points, Math.max(0, maxDaily - earnedToday));

        if (points <= 0) {
          return fail(`Límite diario de ${maxDaily} puntos alcanzado`, 429);
        }

        const { data: walletRow, error: walletErr } = await db
          .from("wallets")
          .select("*")
          .eq("user_id", cust.user_id)
          .single();
        if (walletErr || !walletRow) return fail("Wallet no encontrada", 404);

        const newBalance = (walletRow.points || 0) + points;
        const newLifetime = (walletRow.lifetime_points || 0) + points;
        const tier = getTier(newLifetime, settings.tiers);

        const { error: updateErr } = await db
          .from("wallets")
          .update({
            points: newBalance,
            lifetime_points: newLifetime,
            tier,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", cust.user_id);
        if (updateErr) throw new Error(updateErr.message);

        const { error: ledgerErr } = await db.from("ledger").insert({
          user_id: cust.user_id,
          member_id: normalizedId,
          type: "earn",
          points,
          balance_after: newBalance,
          amount_cop: amount,
          reason: note || "Compra en mostrador",
        });
        if (ledgerErr) throw new Error(ledgerErr.message);

        const gwCfg = googleWalletConfigured();
        if (gwCfg) {
          await patchLoyaltyPoints(gwCfg, normalizedId, newBalance, tier).catch(() => {});
        }

        return json({
          memberId: normalizedId,
          displayName: cust.display_name,
          pointsAdded: points,
          newBalance,
          tier,
          amountCop: amount,
        });
      }

      case "lookupCustomer": {
        const staffPin = String(body.staffPin || "");
        await verifyStaffPin(db, staffPin);

        const q = String(body.query || "").trim();
        if (!q) return fail("Busca por ID de miembro o correo");

        let cust;
        if (q.includes("@")) {
          const { data } = await db
            .from("customers")
            .select("*")
            .eq("email", q.toLowerCase())
            .maybeSingle();
          cust = data;
        } else {
          const { data } = await db
            .from("customers")
            .select("*")
            .eq("member_id", q.toUpperCase())
            .maybeSingle();
          cust = data;
        }

        if (!cust) return fail("Cliente no encontrado", 404);

        const { data: walletRow } = await db
          .from("wallets")
          .select("*")
          .eq("user_id", cust.user_id)
          .maybeSingle();

        return json({
          uid: cust.user_id,
          memberId: cust.member_id,
          displayName: cust.display_name,
          email: cust.email,
          wallet: walletRow
            ? { points: walletRow.points, tier: walletRow.tier }
            : { points: 0, tier: "Amante del café" },
        });
      }

      case "redeemReward": {
        const user = await getUserFromRequest(req, db);
        if (!user) return fail("Inicia sesión primero", 401);

        const rewardId = String(body.rewardId || "");
        const settings = (await getSettings(db)) || (await ensureProgram(db));
        const reward = (settings.rewards || DEFAULT_PROGRAM.rewards).find(
          (r) => r.id === rewardId && r.active,
        );
        if (!reward) return fail("Premio no disponible", 404);

        const { data: walletRow, error: walletErr } = await db
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .single();
        const { data: customer, error: custErr } = await db
          .from("customers")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (walletErr || custErr || !walletRow || !customer) {
          return fail("Wallet no encontrada", 404);
        }

        const balance = walletRow.points || 0;
        if (balance < reward.pointsCost) {
          return fail(`Necesitas ${reward.pointsCost} puntos (tienes ${balance})`, 412);
        }

        const newBalance = balance - reward.pointsCost;
        const code = genRedemptionCode();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const { error: updateErr } = await db
          .from("wallets")
          .update({ points: newBalance, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        if (updateErr) throw new Error(updateErr.message);

        const { error: ledgerErr } = await db.from("ledger").insert({
          user_id: user.id,
          member_id: customer.member_id,
          type: "redeem",
          points: -reward.pointsCost,
          balance_after: newBalance,
          reason: `Canje: ${reward.name}`,
          reward_id: reward.id,
        });
        if (ledgerErr) throw new Error(ledgerErr.message);

        const { error: redeemErr } = await db.from("redemptions").insert({
          user_id: user.id,
          member_id: customer.member_id,
          reward_id: reward.id,
          reward_name: reward.name,
          points_cost: reward.pointsCost,
          code,
          status: "pending",
          expires_at: expiresAt,
        });
        if (redeemErr) throw new Error(redeemErr.message);

        const gwCfg = googleWalletConfigured();
        if (gwCfg) {
          const tier = getTier(walletRow.lifetime_points || 0, settings.tiers);
          await patchLoyaltyPoints(gwCfg, customer.member_id, newBalance, tier).catch(
            () => {},
          );
        }

        return json({
          code,
          rewardName: reward.name,
          newBalance,
          expiresInMinutes: 30,
        });
      }

      case "confirmRedemption": {
        const staffPin = String(body.staffPin || "");
        await verifyStaffPin(db, staffPin);

        const normalizedCode = String(body.code || "")
          .trim()
          .toUpperCase();
        if (!normalizedCode) return fail("Ingresa el código de canje");

        const { data: redemption, error: findErr } = await db
          .from("redemptions")
          .select("*")
          .eq("code", normalizedCode)
          .eq("status", "pending")
          .maybeSingle();

        if (findErr || !redemption) return fail("Código inválido o ya utilizado", 404);

        if (redemption.expires_at && Date.parse(redemption.expires_at) < Date.now()) {
          await db.from("redemptions").update({ status: "expired" }).eq("id", redemption.id);
          return fail("El código expiró. El cliente debe generar uno nuevo.", 410);
        }

        const { error: confirmErr } = await db
          .from("redemptions")
          .update({
            status: "confirmed",
            confirmed_at: new Date().toISOString(),
          })
          .eq("id", redemption.id);
        if (confirmErr) throw new Error(confirmErr.message);

        const { data: customer } = await db
          .from("customers")
          .select("display_name")
          .eq("user_id", redemption.user_id)
          .maybeSingle();

        return json({
          rewardName: redemption.reward_name,
          memberId: redemption.member_id,
          displayName: customer?.display_name || "",
          pointsCost: redemption.points_cost,
        });
      }

      case "verifyStaffPinOnly": {
        await verifyStaffPin(db, String(body.staffPin || ""));
        await ensureProgram(db);
        return json({ ok: true });
      }

      case "updateStaffPin": {
        await verifyStaffPin(db, String(body.currentPin || ""));
        const newPin = String(body.newPin || "");
        if (!newPin || newPin.length < 4) {
          return fail("El PIN nuevo debe tener al menos 4 dígitos");
        }

        const { error } = await db
          .from("program_settings")
          .update({
            staff_pin_hash: await hashPin(newPin),
            pin_updated_at: new Date().toISOString(),
          })
          .eq("id", 1);
        if (error) throw new Error(error.message);
        return json({ ok: true });
      }

      case "getGoogleWalletStatus": {
        const cfg = googleWalletConfigured();
        const issuerId = Deno.env.get("GOOGLE_WALLET_ISSUER_ID")?.trim() || "";
        return json({
          configured: !!cfg,
          issuerConfigured: Boolean(issuerId),
          classId: issuerId ? `${issuerId}.mas_cafe_loyalty` : null,
        });
      }

      case "getGoogleWalletSaveUrl": {
        const user = await getUserFromRequest(req, db);
        if (!user) return fail("Inicia sesión primero", 401);

        const cfg = googleWalletConfigured();
        if (!cfg) {
          return fail("Google Wallet no configurado en el servidor", 503);
        }

        const settings = (await getSettings(db)) || (await ensureProgram(db));

        const { data: customer, error: custErr } = await db
          .from("customers")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (custErr || !customer) {
          return fail("Perfil no encontrado", 404);
        }

        const { data: walletRow } = await db
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        const points = walletRow?.points || 0;
        const tier =
          walletRow?.tier ||
          getTier(walletRow?.lifetime_points || 0, settings.tiers);

        const { saveUrl, objectId: gwObjectId } = await createSaveUrl(cfg, {
          memberId: customer.member_id,
          displayName: customer.display_name,
          points,
          tier,
          brandName: settings.brand_name || DEFAULT_PROGRAM.brandName,
        });

        return json({ saveUrl, objectId: gwObjectId });
      }

      default:
        return fail(`Acción desconocida: ${action}`, 404);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    const status = message.includes("PIN") ? 403 : 500;
    return fail(message, status);
  }
});
