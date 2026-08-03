// Debug trail for the WebRTC signaling/ICE lifecycle (SOS calls today, shared by
// driver<->customer calls if they grow a web view later). Verbose by nature —
// every ICE candidate, connection-state change, etc. — so it only prints in
// dev builds; production stays silent by default.
const DEV = import.meta.env.DEV;

export const callLogger = {
  log: (...args: unknown[]) => {
    if (DEV) console.log("[call]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (DEV) console.warn("[call]", ...args);
  },
  error: (...args: unknown[]) => {
    if (DEV) console.error("[call]", ...args);
  },
};
