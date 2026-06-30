/** Tokens oficiales — guía de marca Más Café (src/app/globals.css) */
import {
  DEFAULT_TYPOGRAPHY,
  buildFontFacesCss,
  loadDriveAssets,
  resolveTypography,
} from "../drive-assets.mjs";

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

export { DEFAULT_TYPOGRAPHY };

export function brandThemeCss(site) {
  const t = { ...BRAND, ...(site.theme || {}) };
  const fonts = resolveTypography(site);
  return `:root{
    --cream:${t.cream};--cream-dark:${t.creamDark};
    --blue:${t.blue};--blue-mid:${t.blueMid};
    --green:${t.green};--sage:${t.sage};
    --brown:${t.brown};--brown-dark:${t.brownDark};
    --cherry:${t.cherry};--charcoal:${t.charcoal};
    --font-display:"${fonts.display}",Georgia,serif;
    --font-body:"${fonts.body}",system-ui,sans-serif;
    --font-accent:"${fonts.accent}",cursive;
    --organic-shadow:0 24px 80px -20px rgba(7,57,84,.18);
  }`;
}

export function fontFaces(depth, site = {}) {
  const manifest = loadDriveAssets();
  return buildFontFacesCss(depth, site, manifest);
}
