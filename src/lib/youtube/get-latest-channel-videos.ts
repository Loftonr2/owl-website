/**
 * get-latest-channel-videos.ts
 * Fetches the latest public, embeddable videos from the OWL Sing Together
 * YouTube channel for the Watch page featured rail.
 *
 * Resolution order:
 *  1. YouTube Data API v3   -- richest metadata, requires YOUTUBE_API_KEY env var
 *  2. YouTube public RSS    -- free, no key needed, returns up to 15 most-recent
 *  3. Hardcoded seed IDs    -- absolute offline last-resort fallback
 *
 * Next.js cache: revalidates every 30 minutes (1800 s).
 * COPPA: embed URLs always use youtube-nocookie.com.
 */

export interface YouTubeFeaturedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  watchUrl: string;
  embedUrl: string;
}

const CHANNEL_ID = "UCPeDZMf79CEO7dgpwJeCmMg";
const REVALIDATE = 1800;
const FALLBACK_IDS = ["zrtwck76T1I", "TzcY0JR6P5M", "Yr0mAPx8UMg"];
// Hard upper bound on each live fetch. This section renders inside a
// Suspense boundary (see FeaturedVideos / WatchPage), but the fetch is
// still bounded so a slow/hanging YouTube response degrades to the
// cached/fallback data quickly instead of holding a request open.
const FETCH_TIMEOUT_MS = 5000;

function videoFromId(id: string, title = "OWL Sing Together", publishedAt = ""): YouTubeFeaturedVideo {
  return {
    id,
    title,
    description: "",
    thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    publishedAt,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
  };
}

async function fetchViaDataApi(apiKey: string, count: number): Promise<YouTubeFeaturedVideo[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", CHANNEL_ID);
  url.searchParams.set("type", "video");
  url.searchParams.set("order", "date");
  url.searchParams.set("maxResults", String(Math.max(count, 6)));
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("videoSyndicated", "true");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`YouTube Data API ${res.status}: ${res.statusText}`);

  interface ApiItem {
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: { maxres?: { url: string }; high?: { url: string } };
    };
  }

  const data = (await res.json()) as { items?: ApiItem[] };
  return (data.items ?? []).slice(0, count).map((item) => {
    const id = item.id.videoId;
    const thumb = item.snippet.thumbnails.maxres?.url ?? item.snippet.thumbnails.high?.url ?? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    return { id, title: item.snippet.title, description: item.snippet.description, thumbnailUrl: thumb, publishedAt: item.snippet.publishedAt, watchUrl: `https://www.youtube.com/watch?v=${id}`, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
  });
}

async function fetchViaRss(count: number): Promise<YouTubeFeaturedVideo[]> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  const res = await fetch(feedUrl, {
    next: { revalidate: REVALIDATE },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`YouTube RSS ${res.status}: ${res.statusText}`);

  const xml = await res.text();
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];

  return entries.slice(0, count).map((entry) => {
    const id = (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) ?? [])[1] ?? "";
    const rawTitle = (entry.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "OWL Sing Together";
    const title = rawTitle.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
    const publishedAt = (entry.match(/<published>([^<]+)<\/published>/) ?? [])[1] ?? "";
    return id ? videoFromId(id, title, publishedAt) : null;
  }).filter((v): v is YouTubeFeaturedVideo => v !== null);
}

/**
 * Returns the latest N public, embeddable OWL Sing Together videos, newest
 * first (`count` defaults to 3 for existing call sites).
 * Tries YouTube Data API -> RSS -> hardcoded fallback.
 * Never throws. Always returns exactly `count` items (last-known-good /
 * hardcoded fallback fills in if live sources are unavailable).
 */
export async function getLatestChannelVideos(count = 3): Promise<YouTubeFeaturedVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      const videos = await fetchViaDataApi(apiKey, count);
      if (videos.length >= count) return videos.slice(0, count);
    } catch (err) {
      console.warn("[getLatestChannelVideos] Data API failed, falling back to RSS:", err);
    }
  }

  try {
    const videos = await fetchViaRss(count);
    if (videos.length >= count) return videos.slice(0, count);
    if (videos.length > 0) {
      const extraIds = FALLBACK_IDS.slice(0, Math.max(count - videos.length, 0));
      const extra = extraIds.map((id) => videoFromId(id));
      return [...videos, ...extra].slice(0, count);
    }
  } catch (err) {
    console.warn("[getLatestChannelVideos] RSS failed, falling back to seed IDs:", err);
  }

  // Absolute last resort: repeat/pad the hardcoded seed IDs to satisfy `count`
  // without ever returning an empty homepage section.
  const padded: YouTubeFeaturedVideo[] = [];
  for (let i = 0; i < count; i++) {
    padded.push(videoFromId(FALLBACK_IDS[i % FALLBACK_IDS.length]));
  }
  return padded;
}
