/**
 * Escala tipográfica oficial — manual de marca Más Café.
 *
 * Roles (content/drive-assets.json + guía de uso):
 * - Playfair Display → títulos (display)
 * - Satoshi → cuerpo, UI, precios, formularios (body)
 * - Marydale → taglines, citas, ampersand en títulos (accent)
 *
 * Una sola escala modular evita tamaños ad hoc (.78rem, .82rem, .88rem, 1.05rem…).
 */
export function brandTypographyCss() {
  return `
    :root{
      /* ── Escala de cuerpo (Satoshi) ── */
      --text-2xs:0.68rem;
      --text-xs:0.75rem;
      --text-sm:0.875rem;
      --text-base:1rem;
      --text-md:1.0625rem;
      --text-lg:1.125rem;

      --leading-tight:1.06;
      --leading-snug:1.35;
      --leading-body:1.65;
      --leading-relaxed:1.75;
      --leading-prose:1.8;

      --tracking-label:0.22em;
      --tracking-ui:0.02em;
      --tracking-wide:0.06em;

      /* ── Escala de títulos (Playfair Display) ── */
      --heading-sm:clamp(1.65rem,3.5vw,2.35rem);
      --heading-md:clamp(1.85rem,4.2vw,2.65rem);
      --heading-lg:clamp(2.1rem,5.5vw,3.35rem);
      --heading-xl:clamp(2.35rem,5.8vw,3.75rem);
      --heading-contact:clamp(1.85rem,4vw,2.5rem);

      --title-h3:1.45rem;
      --title-card:1.35rem;
      --title-sub:1.5rem;
      --title-menu-item:clamp(1.15rem,2.2vw,1.32rem);
      --title-step:1.65rem;
      --title-value:1.15rem;

      /* ── Acento manuscrito (Marydale) ── */
      --tagline-sm:clamp(1.2rem,2.8vw,1.65rem);
      --tagline-md:clamp(1.35rem,3vw,1.85rem);
      --tagline-lg:clamp(1.5rem,3.2vw,2.1rem);
      --tagline-footer:1.75rem;
      --quote:clamp(1.4rem,3.5vw,2rem);

      --price-lg:1.3rem;
      --price-menu:var(--text-sm);
    }

    /* ── Utilidades semánticas ── */
    .text-body{font-size:var(--text-base);line-height:var(--leading-body)}
    .text-lead{font-size:var(--text-md);line-height:var(--leading-prose);color:var(--charcoal)}
    .text-lead-muted{font-size:var(--text-md);line-height:var(--leading-prose);opacity:.85}
    .text-caption{font-size:var(--text-sm);line-height:var(--leading-body)}
    .text-caption-muted{font-size:var(--text-sm);line-height:var(--leading-body);opacity:.72}
    .text-meta{font-size:var(--text-sm);line-height:var(--leading-relaxed);opacity:.85}
    .text-hours{font-size:var(--text-sm);color:var(--brown)}
    .text-fine{font-size:var(--text-xs);line-height:var(--leading-body)}
    .text-micro{font-size:var(--text-2xs);line-height:var(--leading-snug)}
    .text-label{
      font-size:var(--text-2xs);text-transform:uppercase;
      letter-spacing:var(--tracking-label);font-weight:600;
    }
    .contact-subtitle{
      margin-top:2rem;font-family:var(--font-display);
      font-size:var(--title-sub);color:var(--blue);font-weight:500;
    }
    .section-title--contact{font-size:var(--heading-contact)}
    .price-unit{font-size:var(--text-xs);font-weight:400;opacity:.7}
    .footer-line{font-size:var(--text-sm);line-height:var(--leading-snug);opacity:.75}
    .footer-block-title{font-weight:600;margin-bottom:.75rem}
    .footer-address{font-size:var(--text-base);line-height:var(--leading-relaxed);opacity:.85}
    .footer-hours{margin-top:.65rem;font-size:var(--text-sm);opacity:.75}
    .value-copy{margin-top:.5rem;opacity:.75;line-height:var(--leading-body)}
  `;
}
