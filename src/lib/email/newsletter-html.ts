
import "server-only";
import type { NewsletterIssueData } from "@/components/marketing/newsletter-template";
import { siteConfig } from "@/lib/site-config";

/**
 * generateNewsletterHtml
 * ──────────────────────
 * Produces email-safe HTML for a newsletter issue.
 * Table-based layout, inline CSS, absolute image URLs.
 * Design matches OWL Weekly reference image (Newsletter Preview.png).
 * Max content width: 640px.
 */

const BASE = siteConfig.url;

/** Returns an absolute UTM-tagged URL. */
function u(path: string, campaign: string): string {
  const full = path.startsWith("http") ? path : `${BASE}${path}`;
  const sep = full.includes("?") ? "&" : "?";
  return `${full}${sep}utm_source=owl_weekly&utm_medium=email&utm_campaign=${encodeURIComponent(campaign)}`;
}

/** Returns an absolute image URL (handles relative and absolute). */
function imgSrc(path: string | null | undefined): string {
  if (!path) return "";
  return path.startsWith("http") ? path : `${BASE}${path}`;
}

function catColor(cat: string): string {
  const m: Record<string, string> = {
    "newborn care": "#e95b6e",
    "baby sleep": "#0da89f",
    nutrition: "#d97706",
    parenting: "#7c3aed",
    activities: "#0da89f",
    "family life": "#7c3aed",
    "child development": "#0da89f",
    music: "#14b8a6",
  };
  return m[cat.toLowerCase()] ?? "#0da89f";
}

function articleCard(
  article: { image_url: string | null; category: string; title: string; excerpt: string | null; href: string },
  campaign: string,
  readMoreColor: string
): string {
  const href = u(article.href, campaign);
  const color = catColor(article.category);
  const src = imgSrc(article.image_url);
  return `
    <td style="width:33%;padding:0 4px;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e8e0d8;overflow:hidden;">
        ${src ? `<tr><td style="padding:0;line-height:0;font-size:0;">
          <a href="${href}" style="display:block;"><img src="${src}" alt="${article.title.replace(/"/g, "&quot;")}" width="200" style="width:100%;height:108px;object-fit:cover;display:block;" /></a>
        </td></tr>` : ""}
        <tr><td style="padding:5px 8px 2px;">
          <span style="display:inline-block;background:${color};color:#fff;font-size:9px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;padding:2px 8px;border-radius:20px;">${article.category}</span>
        </td></tr>
        <tr><td style="padding:3px 10px 10px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:12px;font-weight:700;color:#1a1a2e;line-height:1.45;">${article.title}</p>
          ${article.excerpt ? `<p style="margin:4px 0 0;font-size:11px;color:#6b7280;line-height:1.5;">${article.excerpt.slice(0, 80)}${article.excerpt.length > 80 ? "\u2026" : ""}</p>` : ""}
          <p style="margin:6px 0 0;"><a href="${href}" style="font-size:11px;font-weight:700;color:${readMoreColor};text-decoration:none;">Read More &#8594;</a></p>
        </td></tr>
      </table>
    </td>`;
}

export function generateNewsletterHtml(data: NewsletterIssueData): string {
  const campaign = data.utm_campaign ?? `owl_weekly_issue_${data.issue_number}`;
  const shopUrl  = u(data.promo_button_url ?? "/shop", campaign);
  const newsUrl  = u("/news", campaign);
  const blogUrl  = u("/blog", campaign);
  const mascot   = `${BASE}/images/brand/mascot.png`;

  const newsCards = data.news_articles.slice(0, 3)
    .map(a => articleCard(a, campaign, "#0da89f")).join("");
  const blogCards = data.blog_posts.slice(0, 3)
    .map(a => articleCard(a, campaign, "#7c3aed")).join("");

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
      .mob-full{width:100%!important;display:block!important;padding-left:0!important;padding-right:0!important;}
      .mob-hide{display:none!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#fdf8f3;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f3;">
<tr><td align="center" style="padding:16px 10px 24px;">

  <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;">
    <tr><td style="text-align:center;padding:0 0 8px;font-size:11px;color:#9ca3af;">
      <a href="${u(`/newsletter/issue-${data.issue_number}`, campaign)}" style="color:#0da89f;text-decoration:underline;">View this email in your browser</a>
    </td></tr>
  </table>

  <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

    <!-- HEADER -->
    <tr>
      <td style="background:linear-gradient(160deg,#fef9f3 0%,#fdf6ee 50%,#f0fbf9 100%);padding:0;">
        <div style="height:4px;background:linear-gradient(90deg,#e95b6e,#f59e0b,#0da89f,#7c3aed);"></div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:130px;vertical-align:bottom;padding:16px 0 0 16px;">
              <img src="${mascot}" alt="OWL Mascot" width="110" height="110" style="display:block;width:110px;height:110px;object-fit:contain;" />
            </td>
            <td style="vertical-align:middle;text-align:left;padding:20px 10px 8px;">
              <div style="font-size:12px;color:#e95b6e;letter-spacing:4px;margin-bottom:4px;">&#9829; &#9825; &#11088;</div>
              <p style="margin:0;line-height:1.05;">
                <span style="font-family:Georgia,serif;font-size:44px;font-weight:900;letter-spacing:-1px;">
                  <span style="color:#1a3a5c;">O</span><span style="color:#0da89f;">W</span><span style="color:#f59e0b;">L</span>
                </span>
                <em style="font-family:Georgia,serif;font-size:32px;font-weight:700;color:#1a3a5c;letter-spacing:-0.5px;"> Weekly</em>
              </p>
              <p style="margin:4px 0 0;font-family:Georgia,serif;font-size:13px;font-style:italic;color:#0da89f;font-weight:600;">Inspire. Educate. Together.</p>
              <div style="font-size:13px;color:#0da89f;margin-top:6px;">&#9835; &#9834;</div>
            </td>
            <td style="vertical-align:top;text-align:right;padding:18px 18px 8px 0;white-space:nowrap;">
              <span style="display:inline-block;background:#e95b6e;color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:24px;">Issue #${data.issue_number} &#9829;</span>
              <div style="margin-top:8px;font-size:11px;color:#6b7280;">&#128197;&nbsp;${data.publication_date}</div>
            </td>
          </tr>
        </table>
        <div style="background:#0da89f;height:10px;margin-top:10px;"></div>
      </td>
    </tr>

    <!-- NOTE FROM OWL -->
    <tr>
      <td style="padding:16px 16px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f7f6;border:1px solid #b2e8e4;border-radius:14px;">
          <tr><td style="padding:16px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:top;width:46px;">
                <div style="width:40px;height:40px;background:#0da89f;border-radius:50%;text-align:center;line-height:40px;font-size:20px;color:#fff;">&#9829;</div>
              </td>
              <td style="vertical-align:top;padding:0 12px;">
                <p style="margin:0;font-family:Georgia,serif;font-size:16px;font-weight:700;color:#0a6e68;">${data.note_title}</p>
                <p style="margin:7px 0 0;font-size:13px;color:#374151;line-height:1.65;">${data.note_body.replace(/\n/g, "<br />")}</p>
                ${data.note_button_label && data.note_button_url ? `<p style="margin:12px 0 0;"><a href="${u(data.note_button_url, campaign)}" style="display:inline-block;background:#0da89f;color:#fff;font-size:12px;font-weight:700;padding:8px 20px;border-radius:20px;text-decoration:none;">${data.note_button_label}</a></p>` : ""}
              </td>
              <td style="vertical-align:middle;text-align:center;width:80px;padding-left:4px;">
                <div style="font-size:14px;color:#e95b6e;margin-bottom:4px;">&#9829;</div>
                ${data.note_image_url
                  ? `<img src="${imgSrc(data.note_image_url)}" alt="" width="64" height="64" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #0da89f;display:inline-block;" />`
                  : `<img src="${mascot}" alt="OWL" width="64" height="64" style="width:64px;height:64px;border-radius:50%;object-fit:contain;border:3px solid #0da89f;background:#fff;display:inline-block;" />`}
              </td>
            </tr></table>
          </td></tr>
        </table>
      </td>
    </tr>

    <!-- STORE PERK + PARENTING TIP -->
    ${(data.promo_headline || data.tip_title) ? `
    <tr><td style="padding:8px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        ${data.promo_headline ? `
        <td class="mob-full" style="width:48%;vertical-align:top;padding-right:5px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#0a6e68 0%,#0da89f 100%);border-radius:14px;">
            <tr><td style="padding:16px;">
              <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#ccf2ef;letter-spacing:0.05em;">This Week's Store Perk</p>
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:top;">
                  <p style="margin:0;font-family:Georgia,serif;font-size:40px;font-weight:900;color:#e95b6e;line-height:1;">${data.promo_discount_pct ?? 15}% Off</p>
                  ${data.promo_product_title ? `<p style="margin:4px 0 0;display:inline-block;background:#f59e0b;color:#fff;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;">${data.promo_product_title}</p>` : ""}
                </td>
                ${data.promo_product_image ? `
                <td style="vertical-align:top;text-align:right;width:70px;">
                  <img src="${imgSrc(data.promo_product_image)}" alt="${data.promo_product_title ?? ""}" width="60" style="width:60px;height:60px;object-fit:contain;border-radius:8px;background:rgba(255,255,255,0.15);padding:4px;display:block;margin-left:auto;" />
                </td>` : `<td style="vertical-align:top;text-align:right;width:30px;font-size:20px;">&#11088;</td>`}
              </tr></table>
              ${data.promo_subheading ? `<p style="margin:6px 0 0;font-size:11px;color:#ccf2ef;">${data.promo_subheading}</p>` : ""}
              <p style="margin:10px 0 4px;display:inline-block;background:rgba(255,255,255,0.2);border-radius:20px;padding:4px 14px;font-size:11px;font-weight:700;color:#fff;">Use code: <strong>OWLWEEKLY${data.promo_discount_pct ?? 15}</strong></p>
              <br/>
              <a href="${shopUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;font-size:12px;font-weight:700;padding:9px 18px;border-radius:20px;text-decoration:none;margin-top:8px;">${data.promo_button_label ?? "Shop the Store"} &#8594;</a>
            </td></tr>
          </table>
        </td>` : ""}
        ${data.tip_title ? `
        <td class="mob-full" style="width:48%;vertical-align:top;padding-left:5px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f3;border:1px solid #e8e0d0;border-radius:14px;">
            <tr><td style="padding:16px;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:top;">
                  <p style="margin:0;font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Parenting Tip</p>
                  <p style="margin:2px 0 0;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#1a1a2e;">of the Week</p>
                </td>
                ${data.tip_age_range ? `<td style="text-align:right;vertical-align:top;"><span style="display:inline-block;background:#0da89f;color:#fff;font-size:9px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;">Ages: ${data.tip_age_range}</span></td>` : ""}
              </tr></table>
              <p style="margin:10px 0 4px;font-size:13px;font-weight:700;color:#0da89f;">&#128161; ${data.tip_title}</p>
              <p style="margin:0;font-size:12px;color:#374151;line-height:1.65;">${data.tip_body}</p>
              ${data.tip_takeaway
                ? `<p style="margin:10px 0 0;padding:8px 10px;background:#fef9c3;border-left:3px solid #d97706;border-radius:4px;font-size:10px;font-style:italic;color:#92400e;"><strong>OWL takeaway:</strong> ${data.tip_takeaway}</p>`
                : `<p style="margin:10px 0 0;font-size:12px;font-weight:600;color:#e95b6e;">&#9829; Consistency + Connection = Confidence</p>`}
            </td></tr>
          </table>
        </td>` : ""}
      </tr></table>
    </td></tr>` : ""}

    ${data.health_alert_title ? `
    <!-- HEALTH ALERT -->
    <tr><td style="padding:8px 16px 4px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fde8e8;border-radius:10px 10px 0 0;">
        <tr><td style="padding:10px 14px;">
          <span style="display:inline-block;width:26px;height:26px;background:#e95b6e;border-radius:50%;text-align:center;line-height:26px;font-size:14px;font-weight:900;color:#fff;vertical-align:middle;">+</span>
          &nbsp;<strong style="font-family:Georgia,serif;font-size:14px;color:#1a1a2e;vertical-align:middle;">Children's Health</strong>
        </td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #fca5a5;border-radius:0 0 10px 10px;border-top:none;">
        <tr><td style="padding:12px 14px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="width:36px;vertical-align:top;">
              <div style="width:30px;height:30px;background:#fef2f2;border:2px solid #e95b6e;border-radius:50%;text-align:center;line-height:28px;font-size:16px;">&#9888;</div>
            </td>
            <td style="vertical-align:top;padding-left:10px;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#e95b6e;">${data.health_alert_title}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#374151;line-height:1.6;">${data.health_alert_body}</p>
            </td>
            ${data.health_alert_url ? `<td style="vertical-align:top;text-align:right;padding-left:12px;white-space:nowrap;"><a href="${u(data.health_alert_url, campaign)}" style="display:inline-block;background:#e95b6e;color:#fff;font-size:11px;font-weight:700;padding:8px 16px;border-radius:20px;text-decoration:none;">Read Alert &#8594;</a></td>` : ""}
          </tr></table>
          ${data.health_alert_source_name ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;background:#f0fbf9;border-radius:6px;"><tr><td style="padding:6px 10px;font-size:10px;color:#374151;">&#9989; Visit the <strong>${data.health_alert_source_name}</strong> for the most up-to-date information.</td></tr></table>` : ""}
        </td></tr>
      </table>
    </td></tr>` : ""}

    ${data.news_articles.length > 0 ? `
    <!-- LATEST NEWS -->
    <tr><td style="padding:14px 16px 6px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
        <td style="vertical-align:middle;">
          <span style="font-size:18px;vertical-align:middle;">&#128227;</span>
          <strong style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1a1a2e;vertical-align:middle;margin-left:6px;">Latest News</strong>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <a href="${newsUrl}" style="font-size:11px;font-weight:700;color:#0da89f;text-decoration:none;">View all news &#8594;</a>
        </td>
      </tr></table>
      <table width="100%" cellpadding="0" cellspacing="0"><tr>${newsCards}</tr></table>
    </td></tr>` : ""}

    ${data.blog_posts.length > 0 ? `
    <!-- LATEST FROM THE BLOG -->
    <tr><td style="padding:14px 16px 6px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr>
        <td style="vertical-align:middle;">
          <span style="font-size:18px;vertical-align:middle;">&#9999;&#65039;</span>
          <strong style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1a1a2e;vertical-align:middle;margin-left:4px;">Latest from the Blog</strong>
          <div style="height:3px;background:#7c3aed;border-radius:2px;margin-top:3px;width:180px;"></div>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <a href="${blogUrl}" style="font-size:11px;font-weight:700;color:#7c3aed;text-decoration:none;">View all blog posts &#8594;</a>
        </td>
      </tr></table>
      <table width="100%" cellpadding="0" cellspacing="0"><tr>${blogCards}</tr></table>
    </td></tr>` : ""}

    <!-- FOOTER -->
    <tr><td style="padding:0;">
      <div style="background:#0da89f;height:10px;margin-top:10px;"></div>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(160deg,#e8f7f6 0%,#fdf8f3 100%);">
        <tr>
          <td style="width:38%;vertical-align:middle;padding:20px 8px 16px 16px;">
            <div style="font-size:12px;color:#e95b6e;margin-bottom:4px;">&#9829; &nbsp; &#9825;</div>
            <img src="${mascot}" alt="OWL" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:contain;" />
            <p style="margin:6px 0 0;font-family:Georgia,serif;font-size:13px;font-weight:700;color:#1a1a2e;line-height:1.4;">Thanks for being<br/>part of the OWL family!</p>
          </td>
          <td style="width:34%;vertical-align:middle;text-align:center;padding:20px 8px 16px;">
            <p style="margin:0 0 8px;font-size:11px;color:#6b7280;">Follow us for daily tips, updates &amp; more!</p>
            <table cellpadding="0" cellspacing="5" style="margin:0 auto;"><tr>
              <td><a href="${siteConfig.social.facebook}" style="display:block;width:32px;height:32px;background:#1877f2;border-radius:50%;text-align:center;line-height:32px;color:#fff;font-size:13px;font-weight:900;text-decoration:none;">f</a></td>
              <td><a href="${siteConfig.social.instagram}" style="display:block;width:32px;height:32px;background:#e1306c;border-radius:50%;text-align:center;line-height:32px;color:#fff;font-size:14px;text-decoration:none;">&#9825;</a></td>
              <td><a href="${siteConfig.social.youtube}" style="display:block;width:32px;height:32px;background:#ff0000;border-radius:50%;text-align:center;line-height:32px;color:#fff;font-size:13px;text-decoration:none;">&#9654;</a></td>
              <td><a href="${siteConfig.social.pinterest}" style="display:block;width:32px;height:32px;background:#e60023;border-radius:50%;text-align:center;line-height:32px;color:#fff;font-size:13px;font-weight:900;text-decoration:none;">P</a></td>
            </tr></table>
          </td>
          <td style="width:28%;vertical-align:middle;text-align:center;padding:20px 16px 16px 8px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:14px;font-style:italic;font-weight:700;color:#0da89f;line-height:1.4;">Sing. Learn.<br/>Grow. Together.</p>
            <div style="font-size:18px;color:#0da89f;margin-top:4px;">&#9835;</div>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;">
        <tr><td style="padding:8px 16px;text-align:center;font-size:10px;color:#9ca3af;line-height:1.8;">
          You&apos;re receiving this because you&apos;re part of the OWL family.
          &nbsp;&middot;&nbsp;<a href="${u(`/newsletter/issue-${data.issue_number}`, campaign)}" style="color:#9ca3af;text-decoration:underline;">View in browser</a>
          &nbsp;&middot;&nbsp;<a href="${BASE}/api/newsletter/unsubscribe" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
          &nbsp;&middot;&nbsp;<a href="${BASE}/portal/settings" style="color:#9ca3af;text-decoration:underline;">Manage Preferences</a>
          <br/>OWL Sing Together &middot; hello@owlsingtogether.com
        </td></tr>
      </table>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}
