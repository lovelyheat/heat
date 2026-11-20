import type {
  CustomStatusData,
  LanyardActivity,
  LanyardData,
  LanyardDiscordUser,
  LanyardEmoji,
  RichPresenceItem,
} from "@/types";

export function getDiscordAvatarUrl(user: LanyardDiscordUser, size = 256): string {
  if (!user.avatar) {
    const index = Number((BigInt(user.id) >> BigInt(22)) % BigInt(6));
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  const ext = user.avatar.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
}

export function getDiscordDecorationUrl(user: LanyardDiscordUser, size = 256): string | null {
  const asset = user.avatar_decoration_data?.asset;
  if (!asset) return null;
  return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=${size}&passthrough=true`;
}

export function getDiscordEmojiUrl(emoji?: LanyardEmoji): string | null {
  if (!emoji?.id || !/^\d+$/.test(emoji.id)) return null;
  const ext = emoji.animated ? "gif" : "webp";
  return `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=48&quality=lossless`;
}

function resolveRawAsset(raw: string | undefined, applicationId?: string): string | null {
  if (!raw) return null;
  if (raw.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${raw.slice("spotify:".length)}`;
  }
  if (raw.startsWith("mp:external/")) {
    const httpsIdx = raw.indexOf("/https/");
    if (httpsIdx !== -1) return `https://${raw.slice(httpsIdx + "/https/".length)}`;
    const httpIdx = raw.indexOf("/http/");
    if (httpIdx !== -1) return `https://${raw.slice(httpIdx + "/http/".length)}`;
    return `https://media.discordapp.net/external/${raw.slice("mp:external/".length)}`;
  }
  if (raw.startsWith("https://")) return raw;
  if (raw.startsWith("youtube:")) return `https://i.ytimg.com/vi/${raw.slice("youtube:".length)}/hqdefault.jpg`;
  if (raw.startsWith("twitch:")) {
    return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${raw.slice("twitch:".length)}-320x180.jpg`;
  }
  if (applicationId) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${raw}.png?size=256`;
  }
  return null;
}

export function getActivityAssetUrl(
  activity: LanyardActivity,
  kind: "large" | "small" = "large",
): string | null {
  if (kind === "large") {
    return (
      resolveRawAsset(activity.assets?.large_image, activity.application_id) ??
      resolveRawAsset(activity.assets?.small_image, activity.application_id)
    );
  }
  if (!activity.assets?.large_image) return null;
  return resolveRawAsset(activity.assets?.small_image, activity.application_id);
}

export function extractRichActivities(lanyard: LanyardData | null): RichPresenceItem[] {
  if (!lanyard || lanyard.discord_status === "offline") return [];

  const items: RichPresenceItem[] = [];
  const hasSpotify = Boolean(lanyard.listening_to_spotify && lanyard.spotify?.song);

  if (hasSpotify && lanyard.spotify) {
    items.push({
      kind: "spotify",
      id: `spotify:${lanyard.spotify.track_id || lanyard.spotify.song}`,
      spotify: lanyard.spotify,
    });
  }

  const seen = new Set<string>();
  for (const act of lanyard.activities ?? []) {
    if (!act || act.type === 4) continue;
    if (hasSpotify && (act.id === "spotify:1" || (act.type === 2 && act.name === "Spotify"))) {
      continue;
    }
    if (![0, 1, 2, 3, 5].includes(act.type)) continue;
    if (!act.name) continue;

    const key = `${act.type}:${act.application_id ?? ""}:${act.name}:${act.details ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({
      kind: "activity",
      id: act.id || key,
      activity: act,
    });
  }

  return items;
}

export function extractCustomStatus(lanyard: LanyardData | null): CustomStatusData | null {
  if (!lanyard || lanyard.discord_status === "offline") return null;
  const custom = (lanyard.activities ?? []).find((a) => a.type === 4);
  if (!custom) return null;

  const text = custom.state?.trim() || null;
  const customEmojiUrl = getDiscordEmojiUrl(custom.emoji);
  const unicodeEmoji =
    !customEmojiUrl &&
    custom.emoji?.name &&
    /\p{Extended_Pictographic}/u.test(custom.emoji.name)
      ? custom.emoji.name
      : null;

  if (!text && !customEmojiUrl && !unicodeEmoji) return null;
  return {
    text,
    unicodeEmoji,
    customEmojiUrl,
    customEmojiAlt: custom.emoji?.name ?? "",
  };
}

export function formatMmSs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const mm = String(mins).padStart(hrs > 0 ? 2 : 1, "0");
  const ss = String(secs).padStart(2, "0");
  return hrs > 0 ? `${hrs}:${mm}:${ss}` : `${mm}:${ss}`;
}
