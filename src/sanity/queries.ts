/**
 * GROQ queries for OWL content. Centralized here so Sanity calls aren't
 * scattered across pages.
 *
 * Phase 2 implements these against real schemas; Phase 1 ships the constants
 * so future imports don't need to be re-wired.
 */

export const videoBySlugQuery = /* groq */ `
  *[_type == "video" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, youtubeId, summary, ageRange, subject, theme, holiday, duration,
    "relatedPrintable": relatedPrintable->{ _id, title, "slug": slug.current, previewImage },
    "relatedProduct": relatedProduct->{ _id, title, "slug": slug.current, price, images },
    "relatedPlaylist": relatedPlaylist->{ _id, title, "slug": slug.current, coverImage }
  }
`;

export const videoArchiveQuery = /* groq */ `
  *[_type == "video" && defined(slug.current)] | order(_createdAt desc){
    _id, title, "slug": slug.current, youtubeId, ageRange, theme, holiday, duration
  }
`;

export const printableBySlugQuery = /* groq */ `
  *[_type == "printable" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, previewImage, freeOrPaid, ageRange, skillTags, pdfFile,
    "relatedVideo": relatedVideo->{ _id, title, "slug": slug.current, youtubeId },
    "relatedProduct": relatedProduct->{ _id, title, "slug": slug.current, price }
  }
`;

export const blogArticleBySlugQuery = /* groq */ `
  *[_type == "blogArticle" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, category, summary, body, publishedAt, seoTitle, seoDescription,
    "relatedContent": relatedContent[]->
  }
`;

export const holidayHubBySlugQuery = /* groq */ `
  *[_type == "holidayHub" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, intro, dateRange,
    "featuredContent": featuredContent[]->,
    "relatedProducts": relatedProducts[]->,
    "relatedPrintables": relatedPrintables[]->
  }
`;
