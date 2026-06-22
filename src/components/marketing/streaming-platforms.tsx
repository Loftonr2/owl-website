/**
 * Streaming platform CTAs — used on /music and playlist detail pages.
 * Phase 5 ships hardcoded buttons; Phase 6 reads the URLs from the Sanity
 * `playlist.platformLinks` field per playlist.
 */
type Props = {
  spotify?: string;
  appleMusic?: string;
  youtubeMusic?: string;
  amazonMusic?: string;
  size?: "sm" | "md";
};

const PLATFORMS = [
  { key: "spotify", label: "Spotify", bg: "bg-[#1DB954] hover:bg-[#1aa54d]" },
  { key: "appleMusic", label: "Apple Music", bg: "bg-owl-ink hover:bg-owl-ink/90" },
  { key: "youtubeMusic", label: "YouTube Music", bg: "bg-[#FF0000] hover:bg-[#e60000]" },
  { key: "amazonMusic", label: "Amazon Music", bg: "bg-[#00A8E1] hover:bg-[#0096cc]" },
] as const;

export function StreamingPlatforms({
  spotify,
  appleMusic,
  youtubeMusic,
  amazonMusic,
  size = "md",
}: Props) {
  const links: Record<string, string | undefined> = { spotify, appleMusic, youtubeMusic, amazonMusic };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PLATFORMS.map(({ key, label, bg }) => {
        const href = links[key];
        if (!href) return null;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-owl-btn font-display font-semibold text-white shadow-sm transition-all ${bg} ${
              size === "sm" ? "h-9 px-4 text-sm" : "h-11 px-5"
            }`}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
