import { siteConfig } from "@/config/site";

const MAX_EMBED_BYTES = 3000;
const BUTTONS_PER_ROW = 5;
const ACCENT_COLOR = 0x0a0a0b;

type SocialKey = keyof typeof siteConfig.socials;

const PREVIEW_BUTTONS: readonly { key: SocialKey; label: string }[] = [
  { key: "discord", label: "Profile" },
  { key: "x", label: "X" },
  { key: "github", label: "GitHub" },
];

export function getLanyardAvatarProxyUrl(discordUserId: string): string {
  return `https://api.lanyard.rest/${discordUserId}.png`;
}

export function buildDiscordComponentEmbedJson(): string {
  const avatarUrl = getLanyardAvatarProxyUrl(siteConfig.discordUserId);
  const buttons = PREVIEW_BUTTONS.map(({ key, label }) => ({
    type: 2,
    style: 5,
    label,
    url: siteConfig.socials[key].href,
  }));

  const rows = [];
  for (let i = 0; i < buttons.length; i += BUTTONS_PER_ROW) {
    rows.push({ type: 1, components: buttons.slice(i, i + BUTTONS_PER_ROW) });
  }

  const payload = {
    component: {
      type: 17,
      accent_color: ACCENT_COLOR,
      components: [
        {
          type: 9,
          components: [
            {
              type: 10,
              content: `## [${siteConfig.name}](${siteConfig.url})\n-# @${siteConfig.socials.discord.handle}`,
            },
          ],
          accessory: { type: 11, media: { url: avatarUrl } },
        },
        { type: 14 },
        ...rows,
      ],
    },
  };

  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  const bytes = new TextEncoder().encode(json).length;
  if (bytes > MAX_EMBED_BYTES) {
    throw new Error(`Discord component embed is ${bytes} bytes, over the ${MAX_EMBED_BYTES}-byte limit`);
  }

  return json;
}
