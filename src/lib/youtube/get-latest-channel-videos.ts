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

async function fetchViaDataApi(apiKey: string): Promise<YouTubeFeaturedVideo[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", CHANNEL_ID);
  url.searchParams.set("type", "video");
  url.searchParams.set("order", "date");
  url.searchParams.set("maxResults", "6");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("videoSyndicated", "true");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: REVALIDATE } });
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
  return (data.items ?? []).slice(0, 3).map((item) => {
    const id = item.id.videoId;
    const thumb = item.snippet.thumbnails.maxres?.url ?? item.snippet.thumbnails.high?.url ?? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    return { id, title: item.snippet.title, description: item.snippet.description, thumbnailUrl: thumb, publishedAt: item.snippet.publishedAt, watchUrl: `https://www.youtube.com/watch?v=${id}`, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
  });
}

async function fetchViaRss(): Promise<YouTubeFeaturedVideo[]> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  const res = await fetch(feedUrl, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`YouTube RSS ${res.status}: ${res.statusText}`);

  const xml = await res.text();
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];

  return entries.slice(0, 3).map((entry) => {
    const id = (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) ?? [])[1] ?? "";
    const rawTitle = (entry.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "OWL Sing Together";
    const title = rawTitle.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
    const publishedAt = (entry.match(/<published>([^<]+)<\/published>/) ?? [])[1] ?? "";
    return id ? videoFromId(id, title, publishedAt) : null;
  }).filter((v): v is YouTubeFeaturedVideo => v !== null);
}

/**
 * Returns the latest 3 public, embeddable OWL Sing Together videos.
 * Tries YouTube Data API -> RSS -> hardcoded fallback.
 * Never throws. Always returns exactly 3 items.
 */
export async function getLatestChannelVideos(): Promise<YouTubeFeaturedVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      const videos = await fetchViaDataApi(apiKey);
      if (videos.length >= 3) return videos.slice(0, 3);
    } catch (err) {
      console.warn("[getLatestChannelVideos] Data API failed, falling back to RSS:", err);
    }
  }

  try {
    const videos = await fetchViaRss();
    if (videos.length >= 3) return videos.slice(0, 3);
    if (videos.length > 0) {
      const extra = FALLBACK_IDS.slice(videos.length).map((id) => videoFromId(id));
      return [...videos, ...extra].slice(0, 3);
    }
  } catch (err) {
    console.warn("[getLatestChannelVideos] RSS failed, falling back to seed IDs:", err);
  }

  return FALLBACK_IDS.map((id) => videoFromId(id));
}
