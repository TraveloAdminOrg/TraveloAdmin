import { Mic, MicOff, PhoneOff, Siren, Volume2 } from "lucide-react";
import Button from "../ui/button/Button";
import { useSos } from "../../context/SosContext";
import {
  counterpartLabel,
  formatDuration,
  initiatorLabel,
  partyName,
  shortRideRef,
} from "../../lib/sos";

/**
 * Persistent bar for the SOS the operator answered. Fixed to the viewport rather
 * than living in a page, so navigating around the panel mid-emergency does not
 * drop the call.
 *
 * The status text is driven by the real peer-connection state — it never claims
 * "connected" before media is actually flowing.
 */
export default function SosActiveCallBar() {
  const {
    activeSession,
    callStatus,
    callError,
    muted,
    durationSeconds,
    audioRef,
    audioBlocked,
    resumeAudio,
    endCall,
    toggleMute,
  } = useSos();

  // The audio sink has to exist before an answer is negotiated, so it is
  // rendered whenever the provider is mounted rather than with the bar.
  const sink = (
    <audio ref={audioRef} autoPlay playsInline className="hidden" />
  );

  if (!activeSession) return sink;

  const counterpart = counterpartLabel(activeSession);

  const statusText =
    callStatus === "connected"
      ? formatDuration(durationSeconds)
      : callStatus === "connecting"
        ? "Connecting…"
        : callStatus === "failed"
          ? (callError ?? "Connection failed")
          : "Ended";

  const dotTone =
    callStatus === "connected"
      ? "bg-success-500"
      : callStatus === "failed"
        ? "bg-error-500"
        : "bg-warning-500 animate-pulse";

  return (
    <>
      {sink}
      <div className="fixed inset-x-0 bottom-0 z-[99998] px-3 pb-3 sm:left-auto sm:right-4 sm:w-[26rem] sm:px-0">
        <div className="rounded-2xl border border-error-200 bg-white p-4 shadow-xl shadow-error-500/10 dark:border-error-500/30 dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-500 text-white">
              <Siren className="size-5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-error-600 dark:text-error-400">
                  SOS active
                </p>
                <span className={`h-2 w-2 rounded-full ${dotTone}`} />
                <span className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
                  {statusText}
                </span>
              </div>

              <p className="mt-0.5 truncate text-sm font-medium text-gray-800 dark:text-white/90">
                {initiatorLabel(activeSession)}:{" "}
                {partyName(activeSession.initiator)}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                Ride {shortRideRef(activeSession)} · {counterpart.label}{" "}
                {counterpart.name}
              </p>
            </div>
          </div>

          {callStatus === "failed" && callError && (
            <p className="mt-3 rounded-lg bg-error-50 px-3 py-2 text-xs text-error-600 dark:bg-error-500/10 dark:text-error-400">
              {callError}
            </p>
          )}

          {callStatus === "connected" && audioBlocked && (
            <button
              type="button"
              onClick={resumeAudio}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-warning-50 px-3 py-2 text-xs font-medium text-warning-700 hover:bg-warning-100 dark:bg-warning-500/10 dark:text-warning-400"
            >
              <Volume2 className="size-4" />
              Audio was blocked — tap to enable sound
            </button>
          )}

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              startIcon={
                muted ? <MicOff className="size-4" /> : <Mic className="size-4" />
              }
              onClick={toggleMute}
              disabled={callStatus !== "connected"}
            >
              {muted ? "Unmute" : "Mute"}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              startIcon={<PhoneOff className="size-4" />}
              onClick={() => void endCall()}
            >
              End call
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
