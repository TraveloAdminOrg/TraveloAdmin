import { io, type Socket } from "socket.io-client";
import { authStorage } from "./auth";

// The socket lives on the API host but at the root, not under /api/v1. Rather
// than requiring a second env var to be set correctly, fall back to deriving it
// from the API base — a missing VITE_SOCKET_URL would otherwise mean SOS alerts
// silently never arrive, which is the worst possible failure for this feature.
const socketOrigin = (): string => {
  const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (explicit) return explicit.replace(/\/+$/, "");

  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!apiBase) {
    console.warn(
      "[socket] Neither VITE_SOCKET_URL nor VITE_API_BASE_URL is set — real-time SOS alerts are disabled.",
    );
    return "";
  }

  try {
    return new URL(apiBase).origin;
  } catch {
    // Relative API base (dev proxy): same-origin socket.
    return "";
  }
};

let socket: Socket | null = null;

// One connection for the whole tab. The handshake carries the admin access
// token in the same `Bearer `-prefixed shape the mobile apps use, because the
// server reads both through the same `extractSocketToken` helper.
export const getSocket = (): Socket | null => {
  const token = authStorage.getToken();
  if (!token) return null;

  if (socket) return socket;

  socket = io(socketOrigin(), {
    transports: ["websocket", "polling"],
    auth: { token: `Bearer ${token}` },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
};

// Called on sign-out. Without this the old socket keeps its now-stale token and
// reconnects forever against a rejected handshake.
export const disconnectSocket = (): void => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};

// The handshake token is captured when the connection is created, so a refreshed
// access token needs a fresh connection to take effect.
export const reconnectSocket = (): Socket | null => {
  disconnectSocket();
  return getSocket();
};
