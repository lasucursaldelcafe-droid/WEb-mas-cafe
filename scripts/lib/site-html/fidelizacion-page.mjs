import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createPathHelpers, loadSite, price, shell } from "./shared.mjs";
import { brandTitleHtml } from "./brand-title.mjs";
import { walletPageUrl } from "../wallet-public-url.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../../..");

function loadWalletProgram() {
  return JSON.parse(readFileSync(path.join(root, "content/wallet-program.json"), "utf8"));
}

function fidelizacionStyles() {
  return `
    .fidel-grid{display:grid;gap:2rem}
    @media(min-width:900px){.fidel-grid--2{grid-template-columns:1fr 1fr;align-items:start}}
    .fidel-card{
      background:#fff;border-radius:var(--radius);padding:1.75rem;
      box-shadow:var(--shadow);border:1px solid rgba(7,57,84,.06);
    }
    .fidel-steps{counter-reset:step;list-style:none;display:grid;gap:1.25rem}
    .fidel-steps li{
      position:relative;padding-left:3rem;font-size:.95rem;line-height:1.65;
    }
    .fidel-steps li::before{
      counter-increment:step;content:counter(step);
      position:absolute;left:0;top:.1rem;width:2rem;height:2rem;border-radius:50%;
      background:var(--blue);color:var(--cream);font-weight:700;font-size:.85rem;
      display:flex;align-items:center;justify-content:center;
    }
    .fidel-qr-box{
      display:flex;flex-direction:column;align-items:center;gap:1rem;
      padding:1.25rem;background:linear-gradient(135deg,rgba(7,57,84,.04),rgba(27,177,117,.08));
      border-radius:1rem;border:1px solid rgba(7,57,84,.1);
    }
    .fidel-qr-box canvas,.fidel-qr-box img{border-radius:.5rem;background:#fff;padding:.35rem}
    .fidel-qr-caption{font-size:.82rem;color:var(--charcoal);opacity:.75;text-align:center;max-width:16rem;line-height:1.5}
    .fidel-rewards{display:grid;gap:1rem}
    @media(min-width:640px){.fidel-rewards{grid-template-columns:repeat(3,1fr)}}
    .fidel-reward{
      padding:1.1rem 1.25rem;border-radius:1rem;background:var(--cream-dark);
      border:1px solid rgba(7,57,84,.08);
    }
    .fidel-reward strong{display:block;font-size:1rem;color:var(--blue);margin-bottom:.35rem}
    .fidel-reward span{font-size:.82rem;opacity:.75}
    .fidel-rules{font-size:.9rem;line-height:1.75;opacity:.85}
    .fidel-rules li{margin-bottom:.35rem}
    .fidel-cta-row{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1.25rem}
    .fidel-promo{
      display:grid;gap:1.5rem;align-items:center;
      padding:2rem;border-radius:var(--radius);
      background:linear-gradient(135deg,var(--blue) 0%,#0d5a42 100%);color:var(--cream);
    }
    @media(min-width:768px){.fidel-promo{grid-template-columns:auto 1fr auto;gap:2rem}}
    .fidel-promo .fidel-qr-box{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2)}
    .fidel-promo .fidel-qr-caption{color:rgba(246,245,239,.85)}
    .fidel-promo h2{color:var(--cream);margin-bottom:.5rem}
    .fidel-promo p{opacity:.9;font-size:.95rem;line-height:1.65}
    .fidel-show-qr{
      display:grid;gap:1.5rem;padding:2rem;border-radius:var(--radius);
      background:var(--cream-dark);border:1px dashed rgba(7,57,84,.15);
    }
    @media(min-width:768px){.fidel-show-qr{grid-template-columns:1fr 1fr;align-items:center}}
  `;
}

function activationQrScript(walletUrl, boxId = "fidel-activation-qr") {
  return `
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js" defer></script>
<script defer>
(function(){
  var url = ${JSON.stringify(walletUrl)};
  function draw(){
    var box = document.getElementById(${JSON.stringify(boxId)});
    if (!box || !window.QRCode) return;
    box.innerHTML = "";
    window.QRCode.toCanvas(url, {
      width: box.dataset.size ? parseInt(box.dataset.size, 10) : 200,
      margin: 2,
      color: { dark: "#073954", light: "#ffffff" }
    }, function(err, canvas) {
      if (!err && canvas) box.appendChild(canvas);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw);
  else draw();
})();
</script>`;
}

function activationQrBlock({ walletUrl, boxId = "fidel-activation-qr", size = 200, caption }) {
  return `
  <div class="fidel-qr-box">
    <div id="${boxId}" data-size="${size}" aria-label="Código QR para activar la wallet"></div>
    <p class="fidel-qr-caption">${caption || "Escanea con la cámara del celular para abrir tu wallet y crear cuenta."}</p>
    <a class="btn btn-blue btn-sm" href="${walletUrl}">Abrir en el navegador</a>
  </div>`;
}

/** Bloque promocional reutilizable (home, contacto, etc.) */
export function loyaltyPromoSection(depth = 0, variant = "light") {
  const { href } = createPathHelpers(depth);
  const walletUrl = walletPageUrl();
  const boxId = `fidel-promo-qr-${depth}`;
  const isDark = variant === "dark";

  const body = isDark
    ? `
  <section class="dark">
    <div class="wrap">
      <div class="fidel-promo">
        ${activationQrBlock({
          walletUrl,
          boxId,
          size: 140,
          caption: "Activa tu tarjeta digital",
        })}
        <div>
          <p class="label" style="color:var(--sage)">Programa de fidelización</p>
          <h2>${brandTitleHtml("Suma puntos en cada visita")}</h2>
          <p>Regístrate gratis, muestra tu QR en caja y canjea café, descuentos y postres.</p>
          <div class="fidel-cta-row">
            <a class="btn btn-sage" href="${href("/wallet")}" data-track="wallet">Entrar a mi wallet</a>
            <a class="btn btn-outline" href="${href("/fidelizacion")}">Cómo funciona</a>
          </div>
        </div>
      </div>
    </div>
  </section>`
    : `
  <section class="alt">
    <div class="wrap">
      <div class="fidel-promo" style="background:linear-gradient(135deg,var(--cream-dark),#fff);color:var(--charcoal);border:1px solid rgba(7,57,84,.08)">
        ${activationQrBlock({
          walletUrl,
          boxId,
          size: 140,
          caption: "QR de activación — escanea para empezar",
        })}
        <div>
          <p class="label">Fidelización Más Café</p>
          <h2 style="color:var(--blue)">${brandTitleHtml("Tu café premia cada visita")}</h2>
          <p style="opacity:.8">1 punto por cada $1.000 de compra. Revisa saldo y premios desde el celular o el computador.</p>
          <div class="fidel-cta-row">
            <a class="btn btn-blue" href="${href("/wallet")}" data-track="wallet">Mi wallet</a>
            <a class="btn btn-outline" href="${href("/fidelizacion")}" style="border-color:var(--blue);color:var(--blue)">Ver programa</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  return {
    html: body,
    extraScript: activationQrScript(walletUrl, boxId),
  };
}

export function pageFidelizacion() {
  const site = loadSite();
  const { brand } = site;
  const pg = site.pages?.fidelizacion || {};
  const program = loadWalletProgram();
  const { href } = createPathHelpers(1);
  const walletUrl = walletPageUrl();
  const walletRel = href("/wallet");
  const activeRewards = (program.rewards || []).filter((r) => r.active);

  const rulesHtml = `
    <ul class="fidel-rules">
      <li><strong>${program.pointsPerThousandCop ?? 1} punto</strong> por cada $1.000 COP de compra</li>
      <li>Compra mínima para sumar: <strong>${price(program.minPurchaseCop ?? 15000)}</strong></li>
      <li>Límite diario: <strong>${program.maxPointsPerDay ?? 500} puntos</strong> por cliente</li>
      <li>Los puntos no caducan (versión actual del programa)</li>
    </ul>`;

  const tiersHtml = (program.tiers || [])
    .map(
      (t) =>
        `<li><strong>${t.name}</strong> — desde ${t.minPoints} puntos acumulados</li>`,
    )
    .join("");

  const rewardsHtml = activeRewards
    .map(
      (r) => `
      <article class="fidel-reward">
        <strong>${r.name}</strong>
        <span>${r.pointsCost} puntos</span>
      </article>`,
    )
    .join("");

  const body = `
  <section class="page-hero light">
    <div class="wrap inner">
      <p class="tagline">${pg.tagline || "Fidelización"}</p>
      <h1>${brandTitleHtml(pg.headline || "Programa de puntos Más Café")}</h1>
      <p class="subhead" style="max-width:36rem;margin-top:1rem;opacity:.85">${pg.intro || "Acumula puntos en cada visita, revisa tu saldo cuando quieras y canjea premios en mostrador."}</p>
      <div class="fidel-cta-row" style="margin-top:1.5rem">
        <a class="btn btn-blue" href="${walletRel}" data-track="wallet">Entrar a mi wallet</a>
        <a class="btn btn-outline" href="${walletRel}">Crear cuenta gratis</a>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap fidel-grid fidel-grid--2">
      <div>
        <header class="section-head" style="text-align:left;margin-bottom:1.25rem">
          <p class="label">Activación</p>
          <h2 class="section-title">${brandTitleHtml("Escanea y empieza")}</h2>
        </header>
        <p style="font-size:.95rem;line-height:1.75;opacity:.85;margin-bottom:1.25rem">
          Este QR abre la wallet digital de ${brand.name}. Desde ahí te registras con correo y contraseña
          (o con Google si está disponible). No necesitas instalar nada: funciona en el navegador del celular
          o en el computador.
        </p>
        ${activationQrBlock({ walletUrl, boxId: "fidel-page-qr", size: 220 })}
      </div>
      <div class="fidel-card">
        <h2 class="section" style="margin-bottom:1rem">¿Cómo funciona?</h2>
        <ol class="fidel-steps">
          <li><strong>Actívate</strong> — escanea el QR o entra a <a href="${walletRel}">mi wallet</a> y crea tu cuenta.</li>
          <li><strong>Compra en tienda</strong> — por cada $1.000 COP sumas puntos (mínimo ${price(program.minPurchaseCop ?? 15000)}).</li>
          <li><strong>Muestra tu QR personal</strong> — en caja escanean el código de tu wallet para acreditarte.</li>
          <li><strong>Canjea premios</strong> — elige un premio en la app, recibe un código y preséntalo en mostrador.</li>
        </ol>
      </div>
    </div>
  </section>

  <section class="alt">
    <div class="wrap">
      <header class="section-head">
        <p class="label">Desde el computador</p>
        <h2 class="section-title">${brandTitleHtml("Revisa puntos y premios sin QR")}</h2>
        <p class="section-intro">Inicia sesión en la wallet con tu correo. Verás saldo, historial, catálogo de canjes y tu código personal.</p>
      </header>
      <div class="fidel-card" style="max-width:40rem;margin:0 auto;text-align:center">
        <p style="font-size:1.05rem;line-height:1.7;margin-bottom:1.25rem">
          Abre <a href="${walletRel}"><strong>mi wallet</strong></a> en el navegador de tu PC o tablet.
          En la pestaña <strong>Historial</strong> ves cada movimiento; en <strong>Premios</strong> lo que puedes reclamar.
        </p>
        <a class="btn btn-blue" href="${walletRel}" data-track="wallet">Ir a mi wallet</a>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <header class="section-head">
        <p class="label">Canjes</p>
        <h2 class="section-title">${brandTitleHtml("Qué puedes reclamar")}</h2>
      </header>
      <div class="fidel-rewards">${rewardsHtml}</div>
      <p style="text-align:center;margin-top:1.25rem;font-size:.88rem;opacity:.7">
        Premios sujetos a disponibilidad en tienda · Se canjean desde la pestaña Premios de tu wallet
      </p>
    </div>
  </section>

  <section class="alt">
    <div class="wrap fidel-show-qr">
      <div>
        <header class="section-head" style="text-align:left;margin-bottom:1rem">
          <p class="label">En mostrador</p>
          <h2 class="section-title">${brandTitleHtml("Tu QR para dar en caja")}</h2>
        </header>
        <p style="font-size:.95rem;line-height:1.75;opacity:.85">
          Después de registrarte, entra a <a href="${walletRel}">mi wallet</a> y abre la pestaña
          <strong>QR</strong>. Ahí aparece tu código único (también puedes dictar tu ID tipo <code>MC-000001</code>).
          El equipo en caja lo escanea o lo busca para sumarte puntos o validar un canje.
        </p>
        <p style="font-size:.9rem;line-height:1.65;opacity:.75;margin-top:1rem">
          Tip: descarga la imagen con QR o instala la wallet en la pantalla de inicio para tenerla a mano.
        </p>
        <div class="fidel-cta-row">
          <a class="btn btn-blue" href="${walletRel}" data-track="wallet">Ver mi QR</a>
          <a class="btn btn-outline" href="${href("/caja")}">Modo caja (personal)</a>
        </div>
      </div>
      <div class="fidel-card" style="text-align:center;padding:2rem">
        <p style="font-size:.85rem;opacity:.7;margin-bottom:1rem">Vista en tu wallet — pestaña QR</p>
        <div style="width:160px;height:160px;margin:0 auto 1rem;border-radius:.75rem;background:linear-gradient(135deg,var(--blue),#0d6e4a);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.9);font-size:.75rem;padding:1rem;line-height:1.4">
          Tu QR personal aparece aquí tras iniciar sesión
        </div>
        <p style="font-size:.82rem;opacity:.75">ID de miembro · puntos · nivel</p>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap fidel-grid fidel-grid--2">
      <div class="fidel-card">
        <h2 class="section" style="margin-bottom:1rem">Reglas del programa</h2>
        ${rulesHtml}
      </div>
      <div class="fidel-card">
        <h2 class="section" style="margin-bottom:1rem">Niveles</h2>
        <ul class="fidel-rules">${tiersHtml}</ul>
      </div>
    </div>
  </section>`;

  return shell({
    title: "Fidelización · puntos y premios",
    description:
      "Programa de fidelización Más Café — activa tu wallet con QR, suma puntos en cada compra y canjea café, descuentos y postres en Cali.",
    depth: 1,
    pageId: "fidelizacion",
    body,
    extraHead: `<style>${fidelizacionStyles()}</style>${activationQrScript(walletUrl, "fidel-page-qr")}`,
  });
}
