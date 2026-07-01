import { resolvePublicSiteUrl } from "./seo.mjs";

/** URL absoluta de la wallet pública (QR de activación / registro). */
export function walletPageUrl() {
  return `${resolvePublicSiteUrl()}/wallet/`;
}
