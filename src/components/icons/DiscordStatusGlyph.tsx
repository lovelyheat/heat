import type { DiscordStatus } from "@/types";

export function DiscordStatusGlyph({ status, mobileOnly }: { status: DiscordStatus; mobileOnly: boolean }) {
  if (status === "online" && mobileOnly) {
    return (
      <svg viewBox="0 0 12 16" aria-hidden="true" className="h-[11px] w-[8.5px] shrink-0 fill-[#23a55a]">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 0.5h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Zm0 2.5a0.5 0.5 0 0 0-0.5 0.5v7.5a0.5 0.5 0 0 0 0.5 0.5h6a0.5 0.5 0 0 0 0.5-0.5V3.5A0.5 0.5 0 0 0 9 3H3Zm3 11.4a0.9 0.9 0 1 0 0-1.8 0.9 0.9 0 0 0 0 1.8Z"
        />
      </svg>
    );
  }
  if (status === "online") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0 fill-[#23a55a]">
        <circle cx="8" cy="8" r="7" />
      </svg>
    );
  }
  if (status === "idle") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0 fill-[#f0b232]">
        <path d="M8.78 1.04A7 7 0 1 1 1.04 8.78A5.5 5.5 0 0 0 8.78 1.04Z" />
      </svg>
    );
  }
  if (status === "dnd") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0 fill-[#f23f43]">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM4.7 6.6h6.6a1.4 1.4 0 1 1 0 2.8H4.7a1.4 1.4 0 1 1 0-2.8Z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-2.5 shrink-0 fill-[#80848e]">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z"
      />
    </svg>
  );
}
