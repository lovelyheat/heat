"use client";

import { useEffect, useState } from "react";

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export interface LanyardDiscordUser {
  id: string;
  username: string;
  display_name?: string | null;
  global_name?: string | null;
  avatar: string | null;
  avatar_decoration_data?: {
    asset: string;
    sku_id: string;
  } | null;
}

export interface LanyardEmoji {
  id?: string;
  name?: string;
  animated?: boolean;
}

export interface LanyardActivity {
  id: string;
  name: string;
  type: number;
  url?: string;
  application_id?: string;
  created_at?: number;
  state?: string | null;
  details?: string | null;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  party?: {
    id?: string;
    size?: [number, number];
  };
  emoji?: LanyardEmoji;
}

export interface LanyardSpotify {
  track_id: string;
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  timestamps: {
    start: number;
    end: number;
  };
}

export interface LanyardData {
  discord_user: LanyardDiscordUser;
  discord_status: DiscordStatus;
  active_on_discord_web?: boolean;
  active_on_discord_desktop?: boolean;
  active_on_discord_mobile?: boolean;
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
}

export type RichPresenceItem =
  | { kind: "spotify"; id: string; spotify: LanyardSpotify }
  | { kind: "activity"; id: string; activity: LanyardActivity };

export interface CustomStatusData {
  text: string | null;
  unicodeEmoji: string | null;
  customEmojiUrl: string | null;
  customEmojiAlt: string;
}

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

const appIconCache = new Map<string, Promise<string | null>>();

export function useAppIcon(applicationId?: string | null): string | null {
  const [icon, setIcon] = useState<{ id: string; url: string | null } | null>(null);

  useEffect(() => {
    if (!applicationId || !/^\d+$/.test(applicationId)) return;
    let cancelled = false;
    let lookup = appIconCache.get(applicationId);
    if (!lookup) {
      lookup = fetch(`https://discord.com/api/v10/applications/${applicationId}/rpc`)
        .then((res) => (res.ok ? res.json() : null))
        .then((app: { icon?: unknown } | null) =>
          typeof app?.icon === "string" && /^[a-f0-9]+$/.test(app.icon)
            ? `https://cdn.discordapp.com/app-icons/${applicationId}/${app.icon}.png?size=256`
            : null,
        )
        .catch(() => null);
      appIconCache.set(applicationId, lookup);
    }
    lookup.then((url) => {
      if (!cancelled) setIcon({ id: applicationId, url });
    });
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  return icon && icon.id === applicationId ? icon.url : null;
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

export function useLanyard(userId: string): LanyardData | null {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    let ws: WebSocket | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let backoffMs = 2000;
    const ctrl = new AbortController();

    const fetchRest = () => {
      fetch(`https://api.lanyard.rest/v1/users/${encodeURIComponent(userId)}`, {
        signal: ctrl.signal,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json: { success?: boolean; data?: LanyardData } | null) => {
          if (!cancelled && json?.success && json.data) {
            setData(json.data);
          }
        })
        .catch(() => {});
    };

    fetchRest();

    const connect = () => {
      if (cancelled) return;
      try {
        ws = new WebSocket("wss://api.lanyard.rest/socket");
      } catch {
        return;
      }

      ws.onopen = () => {
        backoffMs = 2000;
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const msg = JSON.parse(String(event.data)) as {
            op: number;
            t?: string;
            d?: LanyardData & { heartbeat_interval?: number };
          };

          if (msg.op === 1 && msg.d?.heartbeat_interval) {
            ws?.send(
              JSON.stringify({
                op: 2,
                d: { subscribe_to_id: userId },
              }),
            );
            clearInterval(heartbeatTimer);
            heartbeatTimer = setInterval(() => {
              if (ws?.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: 3 }));
              }
            }, msg.d.heartbeat_interval);
          } else if (
            msg.op === 0 &&
            (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") &&
            msg.d
          ) {
            setData(msg.d);
          }
        } catch {}
      };

      ws.onclose = () => {
        clearInterval(heartbeatTimer);
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, backoffMs);
          backoffMs = Math.min(backoffMs * 2, 15_000);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    const handleWake = () => {
      if (document.visibilityState === "visible") {
        fetchRest();
        if (!ws || ws.readyState === WebSocket.CLOSED) {
          clearTimeout(reconnectTimer);
          connect();
        }
      }
    };

    connect();
    document.addEventListener("visibilitychange", handleWake);
    window.addEventListener("online", handleWake);

    return () => {
      cancelled = true;
      ctrl.abort();
      clearInterval(heartbeatTimer);
      clearTimeout(reconnectTimer);
      document.removeEventListener("visibilitychange", handleWake);
      window.removeEventListener("online", handleWake);
      ws?.close();
    };
  }, [userId]);

  return data;
}
