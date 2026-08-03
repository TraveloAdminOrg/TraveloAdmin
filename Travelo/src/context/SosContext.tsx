import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sosApi } from "../api/sos.api";
import { getSocket, disconnectSocket } from "../lib/socket";
import { callLogger } from "../lib/callLogger";
import { getErrorMessage } from "../lib/error";
import { sosKeys } from "../hooks/queries/useSos";
import { useSosCall, type SosCallStatus } from "../hooks/useSosCall";
import { useAuth } from "./AuthContext";
import type { SosSession } from "../types/sos";

// Server -> client events. Client -> server signalling lives in useSosCall.
const EVENTS = {
  INCOMING: "sos:incoming",
  CLAIMED: "sos:claimed",
  CANCELLED: "sos:cancelled",
  ENDED: "sos:ended",
  ACCEPTED: "sos:accepted",
} as const;

interface SosContextValue {
  /** Ringing sessions this operator has not dismissed. */
  queue: SosSession[];
  /** The session this operator answered, if any. */
  activeSession: SosSession | null;
  callStatus: SosCallStatus;
  callError: string | null;
  muted: boolean;
  durationSeconds: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** True when the browser blocked autoplay of the remote audio — the call is
   *  connected but silent until `resumeAudio` runs off a user gesture. */
  audioBlocked: boolean;
  resumeAudio: () => void;
  isAnswering: boolean;
  answer: (sosId: string) => Promise<void>;
  /** Local-only: hides the alert for this operator without cancelling the SOS. */
  dismiss: (sosId: string) => void;
  endCall: () => Promise<void>;
  toggleMute: () => void;
}

const SosContext = createContext<SosContextValue | undefined>(undefined);

// A short two-tone alert, synthesised rather than shipped as an audio file so no
// binary asset enters the repo. Browsers may refuse this until the tab has been
// interacted with — that is a known limitation, not a bug to work around.
const playAlertTone = () => {
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    [0, 0.28].forEach((offset, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = index === 0 ? 880 : 660;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.26);
    });

    setTimeout(() => void ctx.close().catch(() => undefined), 1200);
  } catch {
    /* audio is a nice-to-have; the overlay is the real alert */
  }
};

export const SosProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const [socket, setSocket] = useState(() =>
    isAuthenticated ? getSocket() : null,
  );
  const [queue, setQueue] = useState<SosSession[]>([]);
  const [activeSession, setActiveSession] = useState<SosSession | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Sessions this operator chose to ignore. Kept client-side so dismissing never
  // affects other operators or the session itself.
  const dismissedRef = useRef<Set<string>>(new Set());
  const activeSessionRef = useRef<SosSession | null>(null);
  activeSessionRef.current = activeSession;

  const call = useSosCall(socket);

  // --- socket lifecycle, tied to auth -----------------------------------
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      setSocket(null);
      setQueue([]);
      setActiveSession(null);
      dismissedRef.current.clear();
      return;
    }

    setSocket(getSocket());
  }, [isAuthenticated]);

  const seedQueue = useCallback(async () => {
    try {
      const open = await sosApi.active();
      setQueue(
        open.filter(
          (s) => s.status === "ringing" && !dismissedRef.current.has(s._id),
        ),
      );
      qc.invalidateQueries({ queryKey: sosKeys.active() });
    } catch {
      // A failed seed is not worth a toast — the socket is the primary channel.
    }
  }, [qc]);

  // --- server -> client events -----------------------------------------
  useEffect(() => {
    if (!socket) return;

    // Recover anything raised while this tab was disconnected.
    const onConnect = () => void seedQueue();

    // Both previously fired into the void — a rejected handshake (e.g. a stale
    // token) or a dropped connection during an active SOS call looked exactly
    // like "the call silently stopped working," with no signal anywhere.
    const onConnectError = (err: Error) => {
      callLogger.error("socket connect_error", err.message);
    };

    const onDisconnect = (reason: string) => {
      callLogger.warn("socket disconnected", reason);
      if (activeSessionRef.current) {
        toast.warning("Connection lost — reconnecting...");
      }
    };

    const onIncoming = (payload: { data?: { sos?: SosSession } }) => {
      const sos = payload?.data?.sos;
      if (!sos?._id || dismissedRef.current.has(sos._id)) return;

      setQueue((prev) =>
        prev.some((s) => s._id === sos._id) ? prev : [sos, ...prev],
      );
      playAlertTone();
      qc.invalidateQueries({ queryKey: sosKeys.all });
    };

    // Another operator got there first.
    const onClaimed = (payload: { data?: { sosId?: string } }) => {
      const sosId = payload?.data?.sosId;
      if (!sosId) return;
      if (activeSessionRef.current?._id === sosId) return; // we are the claimer
      setQueue((prev) => prev.filter((s) => s._id !== sosId));
      qc.invalidateQueries({ queryKey: sosKeys.all });
    };

    const onCancelled = (payload: { data?: { sosId?: string } }) => {
      const sosId = payload?.data?.sosId;
      if (!sosId) return;
      setQueue((prev) => prev.filter((s) => s._id !== sosId));
      qc.invalidateQueries({ queryKey: sosKeys.all });
    };

    const onEnded = (payload: {
      data?: { sosId?: string; reason?: string };
    }) => {
      const sosId = payload?.data?.sosId;
      if (!sosId) return;

      setQueue((prev) => prev.filter((s) => s._id !== sosId));

      if (activeSessionRef.current?._id === sosId) {
        call.teardown();
        setActiveSession(null);
        toast.info("The emergency call ended.");
      }
      qc.invalidateQueries({ queryKey: sosKeys.all });
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    socket.on(EVENTS.INCOMING, onIncoming);
    socket.on(EVENTS.CLAIMED, onClaimed);
    socket.on(EVENTS.CANCELLED, onCancelled);
    socket.on(EVENTS.ENDED, onEnded);

    // Already connected when this effect ran (e.g. a remount).
    if (socket.connected) void seedQueue();

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
      socket.off(EVENTS.INCOMING, onIncoming);
      socket.off(EVENTS.CLAIMED, onClaimed);
      socket.off(EVENTS.CANCELLED, onCancelled);
      socket.off(EVENTS.ENDED, onEnded);
    };
    // `call` is stable enough in practice, but teardown is the only member used
    // and it is memoised in the hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, seedQueue, qc, call.teardown]);

  // --- actions ----------------------------------------------------------
  const answer = useCallback(
    async (sosId: string) => {
      setIsAnswering(true);
      try {
        // Claim first. If another operator won, the server returns 409 and we
        // never open a peer connection — two operators cannot both negotiate.
        const claimed = await sosApi.accept(sosId);

        setActiveSession(claimed);
        setQueue((prev) => prev.filter((s) => s._id !== sosId));

        await call.start(sosId);
        qc.invalidateQueries({ queryKey: sosKeys.all });
      } catch (err) {
        setActiveSession(null);
        setQueue((prev) => prev.filter((s) => s._id !== sosId));
        toast.error(getErrorMessage(err));
      } finally {
        setIsAnswering(false);
      }
    },
    [call, qc],
  );

  const dismiss = useCallback((sosId: string) => {
    dismissedRef.current.add(sosId);
    setQueue((prev) => prev.filter((s) => s._id !== sosId));
  }, []);

  const endCall = useCallback(async () => {
    const current = activeSessionRef.current;
    if (!current) return;

    // Tear down locally first so the operator's UI responds instantly even if
    // the request is slow; the server broadcast is what informs the other leg.
    call.teardown();
    setActiveSession(null);

    try {
      await sosApi.end(current._id);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      qc.invalidateQueries({ queryKey: sosKeys.all });
    }
  }, [call, qc]);

  const value = useMemo<SosContextValue>(
    () => ({
      queue,
      activeSession,
      callStatus: call.status,
      callError: call.error,
      muted: call.muted,
      durationSeconds: call.durationSeconds,
      audioRef: call.audioRef,
      audioBlocked: call.audioBlocked,
      resumeAudio: call.resumeAudio,
      isAnswering,
      answer,
      dismiss,
      endCall,
      toggleMute: call.toggleMute,
    }),
    [queue, activeSession, call, isAnswering, answer, dismiss, endCall],
  );

  return <SosContext.Provider value={value}>{children}</SosContext.Provider>;
};

export const useSos = () => {
  const ctx = useContext(SosContext);
  if (!ctx) throw new Error("useSos must be used within SosProvider");
  return ctx;
};
