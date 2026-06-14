import type { SVGProps } from "react";

/**
 * Minimal brand glyphs for social links. Iconsax (the app icon set) ships UI
 * icons, not brand logos, so these few marks live here as inline SVG. Used only
 * by the marketing landing footer/hero, not the product UI.
 */
type IconProps = SVGProps<SVGSVGElement>;

export function FacebookGlyph(props: IconProps) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M14 8.5h2.5V5.6c-.43-.06-1.4-.1-2.3-.1-2.4 0-4 1.46-4 4.15V12H7.5v3h2.7v8h3.3v-8h2.6l.4-3h-3v-1.9c0-.86.24-1.6 1.5-1.6Z" />
    </svg>
  );
}

export function TwitterGlyph(props: IconProps) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.2 3h3.3l-7.2 8.26L22.8 21h-6.6l-5.18-6.78L4.9 21H1.6l7.7-8.84L1.2 3h6.77l4.68 6.2L18.2 3Zm-1.16 16h1.83L7.04 4.9H5.08L17.04 19Z" />
    </svg>
  );
}

export function InstagramGlyph(props: IconProps) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeGlyph(props: IconProps) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22.5 7.2a2.7 2.7 0 0 0-1.9-1.9C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.6.5A2.7 2.7 0 0 0 1.5 7.2 28 28 0 0 0 1 12a28 28 0 0 0 .5 4.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 23 12a28 28 0 0 0-.5-4.8ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z" />
    </svg>
  );
}

export const SOCIALS = [
  { key: "facebook", Glyph: FacebookGlyph },
  { key: "twitter", Glyph: TwitterGlyph },
  { key: "instagram", Glyph: InstagramGlyph },
  { key: "youtube", Glyph: YoutubeGlyph },
] as const;
