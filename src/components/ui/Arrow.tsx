const paths = {
  right: "M3 8h10M9 4l4 4-4 4",
  left: "M13 8H3M7 4 3 8l4 4",
  up: "M8 13V3M4 7l4-4 4 4",
  down: "M8 3v10M4 9l4 4 4-4",
  "up-right": "M4 12 12 4M5.5 4H12v6.5",
  refresh: "M13 8a5 5 0 1 1-1.6-3.7M13.2 2.5v3.2h-3.2",
  grid: "M2.5 2.5h11v11h-11ZM2.5 8h11M8 2.5v11",
} as const;

export type ArrowName = keyof typeof paths;

/** Decorative inline SVG icon: renders identically in every browser, unlike arrow glyphs that depend on the font. */
export default function Arrow({ name }: { name: ArrowName }) {
  return (
    <svg className="arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  );
}
