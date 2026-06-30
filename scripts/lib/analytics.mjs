/**
 * Estadísticas del sitio — clics, páginas vistas y Google Analytics (opcional).
 */

const CLICK_KEYS = ["whatsapp", "tienda", "contacto", "instagram", "facebook"];

const CLICK_LABELS = {
  whatsapp: "WhatsApp",
  tienda: "Tienda / comprar",
  contacto: "Contacto",
  instagram: "Instagram",
  facebook: "Facebook",
};

export function defaultAnalytics() {
  return {
    enabled: true,
    googleAnalyticsId: "",
    clicks: Object.fromEntries(CLICK_KEYS.map((k) => [k, 0])),
    pageviews: {},
    monthlyIncome: [],
    lastPublishedAt: null,
  };
}

export function normalizeAnalytics(raw) {
  const base = defaultAnalytics();
  if (!raw || typeof raw !== "object") return base;
  return {
    enabled: raw.enabled !== false,
    googleAnalyticsId: String(raw.googleAnalyticsId || "").trim(),
    clicks: { ...base.clicks, ...(raw.clicks || {}) },
    pageviews: { ...(raw.pageviews || {}) },
    monthlyIncome: Array.isArray(raw.monthlyIncome) ? raw.monthlyIncome : [],
    lastPublishedAt: raw.lastPublishedAt || null,
  };
}

export function getGoogleAnalyticsId(site, settings = {}) {
  const fromSite = site?.analytics?.googleAnalyticsId?.trim();
  if (fromSite) return fromSite;
  return String(settings?.seo?.googleAnalyticsMeasurementId || "").trim();
}

/** Snippet gtag.js — solo si hay ID de medición (GA4) */
export function googleAnalyticsHead(measurementId) {
  const id = String(measurementId || "").trim();
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return "";
  return `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
  <script>
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());
    gtag('config','${id}',{anonymize_ip:true});
  </script>`;
}

/** Script inline del sitio público: clics + páginas vistas en localStorage */
export function siteAnalyticsScript({ pageId, enabled = true }) {
  if (!enabled) return "";
  const safePageId = String(pageId || "home").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `
      function trackClick(type){
        try{
          var p=JSON.parse(localStorage.getItem('mc_clicks_pending')||'{}');
          p[type]=(p[type]||0)+1;
          localStorage.setItem('mc_clicks_pending',JSON.stringify(p));
        }catch(e){}
      }
      function trackPageView(page){
        try{
          var p=JSON.parse(localStorage.getItem('mc_pageviews_pending')||'{}');
          p[page]=(p[page]||0)+1;
          localStorage.setItem('mc_pageviews_pending',JSON.stringify(p));
        }catch(e){}
      }
      trackPageView('${safePageId}');
      document.querySelectorAll('[data-track]').forEach(function(el){
        el.addEventListener('click',function(){trackClick(el.getAttribute('data-track'));});
      });
      var wa=document.querySelector('.wa-float');
      if(wa)wa.addEventListener('click',function(){trackClick('whatsapp');});
  `;
}

export { CLICK_KEYS, CLICK_LABELS };
