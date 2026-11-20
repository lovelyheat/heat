"use client";

import { useEffect, useState } from "react";
import type { LanyardData } from "@/types";

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
