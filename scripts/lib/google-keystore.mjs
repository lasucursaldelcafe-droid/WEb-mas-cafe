/**
 * Extrae huellas SHA-1 / SHA-256 de un keystore Android (keytool).
 */
import { execSync } from "child_process";
import { existsSync } from "fs";
import { homedir } from "os";
import path from "path";

const DEFAULT_DEBUG = {
  keystorePath: path.join(homedir(), ".android", "debug.keystore"),
  storePassword: "android",
  keyPassword: "android",
  alias: "androiddebugkey",
};

export function resolveKeystoreConfig() {
  const keystorePath =
    process.env.ANDROID_KEYSTORE_PATH?.trim() ||
    process.env.GOOGLE_WALLET_KEYSTORE_PATH?.trim() ||
    (existsSync(DEFAULT_DEBUG.keystorePath) ? DEFAULT_DEBUG.keystorePath : "");

  if (!keystorePath) return null;

  return {
    keystorePath,
    storePassword:
      process.env.ANDROID_KEYSTORE_PASSWORD?.trim() ||
      process.env.GOOGLE_WALLET_KEYSTORE_PASSWORD?.trim() ||
      DEFAULT_DEBUG.storePassword,
    keyPassword:
      process.env.ANDROID_KEY_ALIAS_PASSWORD?.trim() ||
      process.env.ANDROID_KEYSTORE_PASSWORD?.trim() ||
      DEFAULT_DEBUG.keyPassword,
    alias:
      process.env.ANDROID_KEY_ALIAS?.trim() ||
      process.env.GOOGLE_WALLET_KEY_ALIAS?.trim() ||
      DEFAULT_DEBUG.alias,
  };
}

export function extractKeystoreFingerprints(config) {
  if (!config?.keystorePath) {
    return { ok: false, error: "No hay ruta de keystore (ANDROID_KEYSTORE_PATH)" };
  }
  if (!existsSync(config.keystorePath)) {
    return { ok: false, error: `Keystore no encontrado: ${config.keystorePath}` };
  }

  try {
    execSync("keytool -help", { stdio: "ignore" });
  } catch {
    return {
      ok: false,
      error: "keytool no instalado — instala JDK (Java) en el sistema",
    };
  }

  const args = [
    "keytool",
    "-list",
    "-v",
    "-keystore",
    config.keystorePath,
    "-alias",
    config.alias,
    "-storepass",
    config.storePassword,
  ];
  if (config.keyPassword) {
    args.push("-keypass", config.keyPassword);
  }

  try {
    const out = execSync(args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(" "), {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const sha1 = out.match(/SHA1:\s*([^\n\r]+)/i)?.[1]?.trim() ?? null;
    const sha256 = out.match(/SHA256:\s*([^\n\r]+)/i)?.[1]?.trim() ?? null;
    return {
      ok: true,
      sha1,
      sha256,
      keystorePath: config.keystorePath,
      alias: config.alias,
    };
  } catch (err) {
    const msg = err.stderr?.toString() || err.message || "keytool falló";
    return { ok: false, error: msg.trim() };
  }
}

export function printKeystoreInstructions(fingerprints) {
  console.log("\n── Huellas del keystore (Android / Google Wallet SDK) ──");
  if (!fingerprints?.ok) {
    console.log(`  ⚠ ${fingerprints?.error || "Sin huellas"}`);
    console.log("  Comando manual:");
    console.log("  keytool -keystore path-to-debug-or-production-keystore -list -v");
    return;
  }
  console.log(`  Keystore: ${fingerprints.keystorePath}`);
  console.log(`  Alias:    ${fingerprints.alias}`);
  if (fingerprints.sha1) console.log(`  SHA-1:    ${fingerprints.sha1}`);
  if (fingerprints.sha256) console.log(`  SHA-256:  ${fingerprints.sha256}`);
  console.log("\n  Si usas app Android nativa, registra SHA-1 en:");
  console.log("  https://console.cloud.google.com/apis/credentials");
  console.log("  https://pay.google.com/business/console → configuración de app");
}
