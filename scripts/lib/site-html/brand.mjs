/** Tokens oficiales — guía de marca Más Café (src/app/globals.css) */
export const BRAND = {
  cream: "#f6f5ef",
  creamDark: "#ebe8df",
  blue: "#073954",
  blueMid: "#0a4d6e",
  green: "#1bb175",
  sage: "#d8daa8",
  brown: "#b07a3a",
  brownDark: "#8a4a24",
  cherry: "#e84545",
  charcoal: "#2b2b2b",
};

export function brandThemeCss(site) {
  const t = { ...BRAND, ...(site.theme || {}) };
  return `:root{
    --cream:${t.cream};--cream-dark:${t.creamDark};
    --blue:${t.blue};--blue-mid:${t.blueMid};
    --green:${t.green};--sage:${t.sage};
    --brown:${t.brown};--brown-dark:${t.brownDark};
    --cherry:${t.cherry};--charcoal:${t.charcoal};
    --font-display:"Playfair Display",Georgia,serif;
    --font-body:"Satoshi",system-ui,sans-serif;
    --font-accent:"Marydale",cursive;
    --organic-shadow:0 24px 80px -20px rgba(7,57,84,.18);
  }`;
}

export function fontFaces(depth) {
  const up = depth === 0 ? "" : "../".repeat(depth);
  return `
    @font-face{font-family:"Satoshi";src:url("${up}fonts/Satoshi-Regular.woff2") format("woff2");font-weight:400;font-display:swap}
    @font-face{font-family:"Satoshi";src:url("${up}fonts/Satoshi-Medium.woff2") format("woff2");font-weight:500;font-display:swap}
    @font-face{font-family:"Satoshi";src:url("${up}fonts/Satoshi-Bold.woff2") format("woff2");font-weight:700;font-display:swap}
    @font-face{font-family:"Playfair Display";src:url("${up}fonts/PlayfairDisplay-Regular.ttf") format("truetype");font-weight:400;font-display:swap}
    @font-face{font-family:"Playfair Display";src:url("${up}fonts/PlayfairDisplay-Medium.ttf") format("truetype");font-weight:500;font-display:swap}
    @font-face{font-family:"Marydale";src:url("${up}fonts/Marydale-Regular.ttf") format("truetype");font-weight:400;font-display:swap}
  `;
}
