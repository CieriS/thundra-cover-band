import type { SVGProps } from "react";

import type { SocialPlatform } from "@/data/band-data";

interface SocialIconProps extends SVGProps<SVGSVGElement> {
  platform: SocialPlatform;
}

/** Icone brand in stile outline (lucide-react v1 non include più i loghi dei social). */
export function SocialIcon({ platform, ...props }: SocialIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {platform === "instagram" && (
        <>
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
          <circle cx="12" cy="12" r="4.25" />
          <path d="M17.5 6.5h.01" />
        </>
      )}
      {platform === "facebook" && (
        <path d="M18 2.5h-3a5 5 0 0 0-5 5v3H7v4h3v7h4v-7h3l1-4h-4v-3a1 1 0 0 1 1-1h3z" />
      )}
      {platform === "youtube" && (
        <>
          <path d="M2.5 17a24.1 24.1 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" />
        </>
      )}
    </svg>
  );
}
