import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { sosApi } from "../api/sos.api";
import { callLogger } from "../lib/callLogger";

// Mirrors the mobile app's src/hooks/useVoiceCall.ts: same event shapes, same
// candidate-buffering rule, same "only connected when really connected" rule.
// The browser's WebRTC API is close enough to react-native-webrtc that the logic
// is a direct translation rather than a second design.
const SOS_EVENTS = {
  OFFER: "sos:offer",
  ANSWER: "sos:answer",
  ICE_CANDIDATE: "sos:ice_candidate",
  CONNECTED: "sos:connected",
  REPORT_FAILED: "sos:report_failed",
} as const;

const CONNECT_WATCHDOG_MS = 25_000;

export type SosCallStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "ended"
  | "failed";

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface UseSosCall {
  status: SosCallStatus;
  error: string | null;
  muted: boolean;
  durationSeconds: number;
  /** Attach the remote audio sink. Required before answering. */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** True when the browser blocked autoplay of the remote audio track — the
   *  call is connected but silent until `resumeAudio` runs off a user gesture. */
  audioBlocked: boolean;
  /** Retry playing the remote audio sink. Call from a click handler. */
  resumeAudio: () => void;
  start: (sosId: string) => Promise<void>;
  toggleMute: () => void;
  teardown: () => void;
}

export const useSosCall = (socket: Socket | null): UseSosCall => {
  const [status, setStatus] = useState<SosCallStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const sosIdRef = useRef<string | null>(null);
  const candidateBufferRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescriptionSetRef = useRef(false);
  const connectedRef = useRef(false);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const clearWatchdog = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  const teardown = useCallback(() => {
    callLogger.log("teardown", { sosId: sosIdRef.current });
    clearWatchdog();

    pcRef.current?.getSenders().forEach((sender) => {
      try {
        sender.track?.stop();
      } catch {
        /* already stopped */
      }
    });
    try {
      pcRef.current?.close();
    } catch {
      /* already closed */
    }
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (audioRef.current) audioRef.current.srcObject = null;

    candidateBufferRef.current = [];
    remoteDescriptionSetRef.current = false;
    connectedRef.current = false;
    startedAtRef.current = null;
    sosIdRef.current = null;

    setMuted(false);
    setDurationSeconds(0);
    setAudioBlocked(false);
  }, []);

  // Idempotent: either connectionstatechange or iceconnectionstatechange can win.
  const markConnected = useCallback(() => {
    if (connectedRef.current) return;
    connectedRef.current = true;
    clearWatchdog();
    startedAtRef.current = Date.now();
    callLogger.log("connected", { sosId: sosIdRef.current });
    setStatus("connected");

    // Tell the server media is actually flowing, so the session moves to
    // `active` and the recorded duration starts from a real connection.
    if (sosIdRef.current) {
      socket?.emit(SOS_EVENTS.CONNECTED, { sosId: sosIdRef.current });
    }
  }, [socket]);

  const fail = useCallback(
    (message: string, reason = "ice_failed") => {
      callLogger.error("call failed", { sosId: sosIdRef.current, reason, message });
      if (sosIdRef.current) {
        socket?.emit(SOS_EVENTS.REPORT_FAILED, {
          sosId: sosIdRef.current,
          reason,
        });
      }
      teardown();
      setError(message);
      setStatus("failed");
    },
    [socket, teardown],
  );

  const flushCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    const buffered = candidateBufferRef.current;
    candidateBufferRef.current = [];

    for (const candidate of buffered) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        /* a stale candidate is not fatal */
      }
    }
  }, []);

  // `start` only prepares the operator's side. The initiator is always the
  // offerer (it already knows an operator answered), so we wait for `sos:offer`.
  const start = useCallback(
    async (sosId: string) => {
      callLogger.log("start", { sosId, socketConnected: socket?.connected });
      if (!socket) {
        setError("Not connected to the server. Refresh and try again.");
        setStatus("failed");
        return;
      }

      setError(null);
      setStatus("connecting");
      sosIdRef.current = sosId;
      connectedRef.current = false;
      remoteDescriptionSetRef.current = false;
      candidateBufferRef.current = [];

      let iceServers: RTCIceServer[] = [];
      try {
        iceServers = (await sosApi.iceServers()) as RTCIceServer[];
        callLogger.log(
          "ICE servers fetched",
          iceServers.map((s) => ({ urls: s.urls, hasCredential: !!s.credential })),
        );
      } catch (err) {
        // Match the app's behaviour: fall back to public STUN and warn, rather
        // than refusing to try at all.
        iceServers = [
          {
            urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
          },
        ];
        callLogger.warn(
          "Could not fetch ICE servers — falling back to STUN only. Calls across NAT may fail.",
          err,
        );
      }

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        localStreamRef.current = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        callLogger.log("microphone acquired");
      } catch (err) {
        callLogger.error("getUserMedia failed", err);
        fail(
          "Microphone access was blocked. Allow the microphone and answer again.",
          "no_microphone",
        );
        return;
      }

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        callLogger.log("ontrack", { kind: event.track.kind, hasStream: !!remoteStream });
        if (audioRef.current && remoteStream) {
          audioRef.current.srcObject = remoteStream;
          setAudioBlocked(false);
          // `ontrack` fires asynchronously once negotiation completes, which can
          // land outside the user-activation window from the original "answer"
          // click — autoplay is then refused and the call looks connected but
          // silent. Surface that instead of swallowing it.
          audioRef.current.play().catch((err) => {
            callLogger.warn("remote audio autoplay was blocked", err);
            setAudioBlocked(true);
          });
        }
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate || !sosIdRef.current) return;
        // `typ` tells us whether this is a host/srflx/relay candidate — a call
        // that never gathers a `relay` candidate has no TURN path and will fail
        // to connect across NATs a direct/STUN candidate can't traverse.
        const typ = /typ (\w+)/.exec(event.candidate.candidate)?.[1] ?? "unknown";
        callLogger.log("local ICE candidate", { typ, candidate: event.candidate.candidate });
        socket.emit(SOS_EVENTS.ICE_CANDIDATE, {
          sosId: sosIdRef.current,
          candidate: event.candidate.toJSON(),
        });
      };

      pc.onicegatheringstatechange = () => {
        callLogger.log("ICE gathering state", pc.iceGatheringState);
      };

      pc.onconnectionstatechange = () => {
        callLogger.log("connection state", pc.connectionState);
        if (pc.connectionState === "connected") markConnected();
        if (pc.connectionState === "failed") {
          fail("The emergency call could not connect. Ask them to try again.");
        }
      };

      pc.oniceconnectionstatechange = () => {
        callLogger.log("ICE connection state", pc.iceConnectionState);
        if (
          pc.iceConnectionState === "connected" ||
          pc.iceConnectionState === "completed"
        ) {
          markConnected();
        }
        if (pc.iceConnectionState === "failed") {
          fail("The emergency call could not connect. Ask them to try again.");
        }
      };

      clearWatchdog();
      watchdogRef.current = setTimeout(() => {
        if (!connectedRef.current) {
          callLogger.error("connect watchdog fired — no relay candidates seen in time", {
            sosId: sosIdRef.current,
            iceGatheringState: pc.iceGatheringState,
            iceConnectionState: pc.iceConnectionState,
          });
          fail("No audio connection was established. Ask them to try again.");
        }
      }, CONNECT_WATCHDOG_MS);
    },
    [socket, fail, markConnected],
  );

  // Signalling listeners. Registered once per socket and keyed on sosId so a
  // late message from a previous session cannot disturb the current one.
  useEffect(() => {
    if (!socket) return;

    const onOffer = async (payload: Envelope<{ sosId: string; sdp: RTCSessionDescriptionInit }>) => {
      const data = payload?.data;
      const pc = pcRef.current;
      callLogger.log("received sos:offer", { sosId: data?.sosId, hasPc: !!pc });
      if (!data?.sdp || !pc) return;
      if (data.sosId !== sosIdRef.current) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        remoteDescriptionSetRef.current = true;
        await flushCandidates();

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        callLogger.log("sending sos:answer", { sosId: data.sosId });
        socket.emit(SOS_EVENTS.ANSWER, {
          sosId: data.sosId,
          sdp: { type: answer.type, sdp: answer.sdp },
        });
      } catch (err) {
        callLogger.error("negotiation failed", err);
        fail("Could not negotiate the emergency call.", "negotiation_failed");
      }
    };

    const onCandidate = async (payload: Envelope<{ sosId: string; candidate: RTCIceCandidateInit }>) => {
      const data = payload?.data;
      const pc = pcRef.current;
      if (!data?.candidate || !pc) return;
      if (data.sosId !== sosIdRef.current) return;

      const typ = /typ (\w+)/.exec(data.candidate.candidate ?? "")?.[1] ?? "unknown";
      callLogger.log("remote ICE candidate", { typ });

      // Candidates can beat the offer; buffer until there is a remote
      // description to attach them to.
      if (!remoteDescriptionSetRef.current) {
        candidateBufferRef.current.push(data.candidate);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        callLogger.warn("addIceCandidate failed (stale candidate, not fatal)", err);
      }
    };

    socket.on(SOS_EVENTS.OFFER, onOffer);
    socket.on(SOS_EVENTS.ICE_CANDIDATE, onCandidate);

    return () => {
      socket.off(SOS_EVENTS.OFFER, onOffer);
      socket.off(SOS_EVENTS.ICE_CANDIDATE, onCandidate);
    };
  }, [socket, flushCandidates, fail]);

  // Duration ticker, live only while connected.
  useEffect(() => {
    if (status !== "connected") return;

    const tick = setInterval(() => {
      if (startedAtRef.current) {
        setDurationSeconds(
          Math.floor((Date.now() - startedAtRef.current) / 1000),
        );
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [status]);

  // Never leave a peer connection or a live microphone behind on unmount.
  useEffect(() => teardown, [teardown]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    localStreamRef.current
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !next));
    setMuted(next);
  }, [muted]);

  const resumeAudio = useCallback(() => {
    audioRef.current
      ?.play()
      .then(() => setAudioBlocked(false))
      .catch((err) => console.warn("[sos] resumeAudio failed:", err));
  }, []);

  return {
    status,
    error,
    muted,
    durationSeconds,
    audioRef,
    audioBlocked,
    resumeAudio,
    start,
    toggleMute,
    teardown,
  };
};
