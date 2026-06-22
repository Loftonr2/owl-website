import { AmbientLayer } from "./ambient-layer";

/**
 * HomeAmbient — composed ambient slot for the homepage hero.
 *
 * Mixes two patterns at low density so the hero never overwhelms the
 * illustration. Notes lean teal (music association), sparkles lean amber
 * (warmth). Both honor data-motion="off" via the global CSS rule.
 *
 * Used as the `ambient` slot of <BannerHero>.
 */
export function HomeAmbient() {
  return (
    <>
      <AmbientLayer
        pattern="notes"
        density={4}
        seed={11}
        className="inset-x-0 top-0 h-[70%]"
      />
      <AmbientLayer
        pattern="sparkles"
        density={3}
        seed={29}
        className="inset-x-0 top-[20%] h-[80%]"
      />
    </>
  );
}
