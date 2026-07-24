
import "server-only";
import type { NewsletterIssueData } from "@/components/marketing/newsletter-template";
import { siteConfig } from "@/lib/site-config";

/**
 * generateNewsletterHtml
 * ──────────────────────
 * Produces email-safe HTML for a newsletter issue.
 * Table-based layout, inline CSS, absolute image URLs.
 * Tested against Gmail, Outlook, Apple Mail, and mobile clients.
 * Max content width: 640px.
 */

const BASE = siteConfig.url;

function u(path: string, campaign: string): string {
  const full = path.startsWith("http") ? path : `${BASE}${path}`;
  const sep = full.includes("?") ? "&" : "?";
  return `${full}${sep}utm_source=owl_weekly&utm_medium=email&utm_campaign=${encodeURIComponent(campaign)}`;
}

function catColor(cat: string): string {
  const m: Record<string, string> = {
    "newborn care": "#0da89f", "baby sleep": "#146b44",
    nutrition: "#d97706", parenting: "#e95b6e",
    activities: "#0da89f", "family life": "#7c3aed",
    "child development": "#0da89f", music: "#146b44",
  };
  return m[cat.toLowerCase()] ?? "#0da89f";
}

function articleCardHtml(
  article: { image_url: string | null; category: string; title: string; excerpt: string | null; href: string },
  campaign: string
): string {
  const href = u(article.href, campaign);
  const color = catColor(article.category);
  return `
    <td style="width:33%;padding:4px;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;border:1px solid #f0f0f0;overflow:hidden;background:#fff;">
        ${article.image_url ? `
        <tr>
          <td style="padding:0;position:relative;">
            <a href="${href}" style="display:block;"><img src="${BASE}${article.image_url}" alt="${article.title.replace(/"/g, "&quot;")}" width="200" style="width:100%;height:100px;object-fit:cover;display:block;" /></a>
            <div style="position:absolute;top:6px;left:6px;background:${color};color:#fff;font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:2px 7px;border-radius:20px;">${article.category}</div>
          </td>
        </tr>` : `
        <tr><td style="padding:8px 10px;"><span style="background:${color};color:#fff;font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:2px 7px;border-radius:20px;">${article.category}</span></td></tr>
        `}
        <tr>
          <td style="padding:8px 10px 6px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:12px;font-weight:700;color:#1a1a2e;line-height:1.4;">${article.title}</p>
            ${article.excerpt ? `<p style="margin:4px 0 0;font-size:11px;color:#6b7280;line-height:1.5;">${article.excerpt.slice(0, 90)}${article.excerpt.length > 90 ? "…" : ""}</p>` : ""}
            <p style="margin:6px 0 0;"><a href="${href}" style="font-size:11px;font-weight:700;color:${color};text-decoration:none;">Read More →</a></p>
          </td>
        </tr>
      </table>
    </td>`;
}

export function generateNewsletterHtml(data: NewsletterIssueData): string {
  const campaign = data.utm_campaign ?? `owl_weekly_issue_${data.issue_number}`;
  const shopUrl = u(data.promo_button_url ?? "/shop", campaign);
  const newsUrl = u("/news", campaign);
  const blogUrl = u("/blog", campaign);

  const newsCards = data.news_articles.slice(0, 3).map(a => articleCardHtml(a, campaign)).join("");
  const blogCards = data.blog_posts.slice(0, 3).map(a => articleCardHtml(a, campaign)).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>OWL Weekly — Issue #${data.issue_number}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @media only screen and (max-width:600px){
      .mob-full{width:100%!important;display:block!important;}
      .mob-hide{display:none!important;}
      .mob-pad{padding:10px!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
<tr><td align="center" style="padding:20px 10px;">

  <!-- View in browser -->
  <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;">
    <tr><td style="text-align:center;padding:0 0 6px;font-size:11px;color:#9ca3af;">
      <a href="${u(`/newsletter/issue-${data.issue_number}`, campaign)}" style="color:#0da89f;text-decoration:underline;">View this email in your browser</a>
    </td></tr>
  </table>

  <!-- WRAPPER -->
  <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <!-- ── HEADER ─────────────────────────────────────────── -->
    <tr>
      <td style="background:linear-gradient(135deg,#e8f9f8 0%,#f0fbf9 60%,#fff8ec 100%);padding:0;">
        <!-- Teal bar -->
        <div style="height:6px;background:linear-gradient(90deg,#0da89f 0%,#14b8a6 50%,#0da89f 100%);"></div>
        <table width="100%" cellpadding="16" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <img src="${BASE}/images/brand/owl-mascot.png" alt="OWL Mascot" width="60" height="60" style="display:block;width:60px;height:60px;object-fit:contain;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:900;color:#1a1a2e;line-height:1;">
                      O<span style="color:#0da89f;">W</span>L <em style="font-size:22px;">Weekly</em>
                    </p>
                    <p style="margin:2px 0 0;font-size:12px;font-weight:600;color:#4b5563;">Inspire. Educate. Together.</p>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align:right;vertical-align:middle;padding:16px;">
              <span style="display:inline-block;background:#e95b6e;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;">&#9829; Issue #${data.issue_number}</span>
              <br/>
              <span style="font-size:11px;color:#9ca3af;margin-top:4px;display:inline-block;">&#128197; ${data.publication_date}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── NOTE FROM OWL ──────────────────────────────────── -->
    <tr>
      <td style="padding:16px 16px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e2f7f6;border-radius:12px;padding:16px;">
          <tr>
            <td style="vertical-align:top;padding-right:12px;width:42px;">
              <div style="width:36px;height:36px;background:#e2f7f6;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;line-height:36px;font-size:18px;">&#9829;</div>
            </td>
            <td style="vertical-align:top;">
              <p style="margin:0;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#1a1a2e;">${data.note_title}</p>
              <p style="margin:8px 0 0;font-size:13px;color:#4b5563;line-height:1.6;">${data.note_body.replace(/\n/g, "<br />")}</p>
              ${data.note_button_label && data.note_button_url ? `<p style="margin:10px 0 0;"><a href="${u(data.note_button_url, campaign)}" style="display:inline-block;background:#0da89f;color:#fff;font-size:12px;font-weight:700;padding:7px 18px;border-radius:20px;text-decoration:none;">${data.note_button_label}</a></p>` : ""}
            </td>
            ${data.note_image_url ? `<td style="vertical-align:top;padding-left:12px;width:64px;"><img src="${data.note_image_url}" alt="" width="56" height="56" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #e2f7f6;" /></td>` : ""}
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── STORE PROMO + PARENTING TIP ───────────────────── -->
    <tr>
      <td style="padding:8px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            ${data.promo_headline ? `
            <td class="mob-full" style="width:48%;vertical-align:top;padding-right:6px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0da89f 0%,#0f9e96 100%);border-radius:12px;">
                <tr><td style="padding:16px;">
                  <p style="margin:0;font-size:12px;font-weight:600;color:#ccf2ef;">${data.promo_headline}</p>
                  ${data.promo_product_image ? `<img src="${BASE}${data.promo_product_image}" alt="${data.promo_product_title ?? ""}" width="60" style="margin:8px 0;width:60px;height:60px;object-fit:contain;background:rgba(255,255,255,0.2);border-radius:8px;padding:4px;" />` : ""}
                  <p style="margin:4px 0;font-family:Georgia,serif;font-size:38px;font-weight:900;color:#fbbf24;line-height:1;">${data.promo_discount_pct ?? 15}% Off</p>
                  ${data.promo_subheading ? `<p style="margin:2px 0 6px;font-size:11px;color:#ccf2ef;">${data.promo_subheading}</p>` : ""}
                  <p style="margin:4px 0 10px;display:inline-block;background:rgba(255,255,255,0.25);border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;color:#fff;">Use code: OWLWEEKLY${data.promo_discount_pct ?? 15}</p>
                  <br/>
                  <a href="${shopUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;font-size:12px;font-weight:700;padding:8px 16px;border-radius:20px;text-decoration:none;">${data.promo_button_label ?? "Shop the Store"} &#8594;</a>
                </td></tr>
              </table>
            </td>` : ""}
            ${data.tip_title ? `
            <td class="mob-full" style="width:48%;vertical-align:top;padding-left:6px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;">
                <tr><td style="padding:14px;">
                  <table width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td style="vertical-align:top;">
                      <p style="margin:0;font-family:Georgia,serif;font-size:13px;font-weight:700;color:#1a1a2e;">Parenting Tip<br/>of the Week</p>
                    </td>
                    ${data.tip_age_range ? `<td style="text-align:right;vertical-align:top;"><span style="background:#0da89f;color:#fff;font-size:9px;font-weight:700;padding:3px 8px;border-radius:20px;">Ages: ${data.tip_age_range}</span></td>` : ""}
                  </tr></table>
                  <p style="margin:8px 0 4px;font-size:12px;font-weight:700;color:#0da89f;">${data.tip_title}</p>
                  <p style="margin:0;font-size:11px;color:#4b5563;line-height:1.6;">${data.tip_body}</p>
                  ${data.tip_takeaway ? `<p style="margin:8px 0 0;padding:8px;background:#fef9c3;border-left:3px solid #d97706;border-radius:4px;font-size:10px;font-style:italic;color:#92400e;"><strong>OWL takeaway:</strong> ${data.tip_takeaway}</p>` : `<p style="margin:8px 0 0;font-size:10px;font-weight:600;color:#e95b6e;">&#9829; Consistency + Connection = Confidence</p>`}
                </td></tr>
              </table>
            </td>` : ""}
          </tr>
        </table>
      </td>
    </tr>

    ${data.health_alert_title ? `
    <!-- ── HEALTH ALERT ─────────────────────────────────── -->
    <tr>
      <td style="padding:8px 16px;">
        <table width="100%" cellpadding="12" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:14px;font-weight:700;color:#1a1a2e;">&#128721; ${data.health_alert_title}</p>
              <table width="100%" cellpadding="10" cellspacing="0" style="background:#fff;border:1px solid #fca5a5;border-radius:8px;">
                <tr>
                  <td style="font-size:11px;color:#4b5563;">${data.health_alert_body}</td>
                  ${data.health_alert_url ? `<td style="text-align:right;white-space:nowrap;"><a href="${u(data.health_alert_url, campaign)}" style="display:inline-block;background:#e95b6e;color:#fff;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px;text-decoration:none;">Read Alert &#8594;</a></td>` : ""}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ""}

    ${data.news_articles.length > 0 ? `
    <!-- ── LATEST NEWS ───────────────────────────────────── -->
    <tr>
      <td style="padding:12px 16px 4px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-family:Georgia,serif;font-size:16px;font-weight:700;color:#1a1a2e;">&#128227; Latest News</p>
            </td>
            <td style="text-align:right;vertical-align:middle;">
              <a href="${newsUrl}" style="font-size:11px;font-weight:700;color:#0da89f;text-decoration:none;">View all news &#8594;</a>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="4" cellspacing="0" style="margin-top:10px;">
          <tr>${newsCards}</tr>
        </table>
      </td>
    </tr>` : ""}

    ${data.blog_posts.length > 0 ? `
    <!-- ── LATEST FROM THE BLOG ──────────────────────────── -->
    <tr>
      <td style="padding:12px 16px 4px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-family:Georgia,serif;font-size:16px;font-weight:700;color:#1a1a2e;">&#9999;&#65039; Latest from the Blog</p>
            </td>
            <td style="text-align:right;vertical-align:middle;">
              <a href="${blogUrl}" style="font-size:11px;font-weight:700;color:#7c3aed;text-decoration:none;">View all blog posts &#8594;</a>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="4" cellspacing="0" style="margin-top:10px;">
          <tr>${blogCards}</tr>
        </table>
      </td>
    </tr>` : ""}

    <!-- ── FOOTER ────────────────────────────────────────── -->
    <tr>
      <td style="background:linear-gradient(135deg,#e8f9f8 0%,#f0fbf9 100%);border-top:1px solid #ccf2ef;padding:20px 16px;text-align:center;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <img src="${BASE}/images/brand/owl-mascot.png" alt="OWL Sing Together" width="36" height="36" style="display:inline-block;width:36px;height:36px;object-fit:contain;" />
              <p style="margin:4px 0;font-family:Georgia,serif;font-size:13px;font-weight:700;color:#1a1a2e;">Thanks for being part of the OWL family!</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:10px 0 0;">
              <p style="margin:0;font-size:11px;color:#6b7280;">Follow us for daily tips, updates &amp; more!</p>
              <table cellpadding="0" cellspacing="4" style="margin:8px auto 0;">
                <tr>
                  <td><a href="${siteConfig.social.facebook}" style="display:block;width:28px;height:28px;background:#1877f2;border-radius:50%;text-align:center;line-height:28px;color:#fff;font-size:12px;font-weight:700;text-decoration:none;">f</a></td>
                  <td><a href="${siteConfig.social.instagram}" style="display:block;width:28px;height:28px;background:#e1306c;border-radius:50%;text-align:center;line-height:28px;color:#fff;font-size:12px;font-weight:700;text-decoration:none;">&#9825;</a></td>
                  <td><a href="${siteConfig.social.youtube}" style="display:block;width:28px;height:28px;background:#ff0000;border-radius:50%;text-align:center;line-height:28px;color:#fff;font-size:12px;font-weight:700;text-decoration:none;">&#9654;</a></td>
                  <td><a href="${siteConfig.social.pinterest}" style="display:block;width:28px;height:28px;background:#e60023;border-radius:50%;text-align:center;line-height:28px;color:#fff;font-size:12px;font-weight:700;text-decoration:none;">P</a></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:10px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:11px;font-style:italic;font-weight:700;color:#0da89f;">Sing. Learn. Grow. Together.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:10px;font-size:10px;color:#9ca3af;line-height:1.8;">
              You&apos;re receiving this because you&apos;re part of the OWL family.<br/>
              <a href="${u(`/newsletter/issue-${data.issue_number}`, campaign)}" style="color:#0da89f;text-decoration:underline;">View in browser</a> &middot;
              <a href="${BASE}/portal/settings" style="color:#9ca3af;text-decoration:underline;">Manage Preferences</a> &middot;
              <a href="${BASE}/api/newsletter/unsubscribe" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a> &middot;
              <a href="${BASE}/contact" style="color:#9ca3af;text-decoration:underline;">Privacy</a>
              <br/>OWL Sing Together &middot; hello@owlsingtogether.com
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
  <!-- /WRAPPER -->

</td></tr>
</table>
</body>
</html>`;
}
