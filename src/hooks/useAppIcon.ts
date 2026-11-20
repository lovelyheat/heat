"use client";

import { useEffect, useState } from "react";

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
