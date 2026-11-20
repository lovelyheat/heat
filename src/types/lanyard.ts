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
