import { useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Globe, LoaderCircle } from "lucide-react";

import { getTunnelStatus, startTunnel, stopTunnel } from "@/api";
import { inHookContext } from "@/components/Dashboard/Dashboard";
import type { ITunnelStatus } from "@/types/webhook";

export const TunnelToggle = () => {
  const { tunnelStatus, setTunnelStatus } = useContext(inHookContext) as {
    tunnelStatus?: ITunnelStatus;
    setTunnelStatus: (status: ITunnelStatus) => void;
  };
  const [busy, setBusy] = useState(false);

  const state = tunnelStatus?.state ?? "disabled";

  // While the tunnel is connecting, poll until it settles.
  useEffect(() => {
    if (state !== "connecting") {
      return;
    }
    const interval = setInterval(() => {
      getTunnelStatus()
        .then(setTunnelStatus)
        .catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [state, setTunnelStatus]);

  const handleClick = async () => {
    setBusy(true);
    try {
      if (state === "connected" || state === "connecting") {
        setTunnelStatus(await stopTunnel());
      } else {
        setTunnelStatus(await startTunnel());
      }
    } catch (err) {
      console.error("Tunnel toggle failed: ", err);
      // The backend records the failure; pull the authoritative state.
      getTunnelStatus()
        .then(setTunnelStatus)
        .catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  const label =
    state === "connected"
      ? "Public"
      : state === "connecting"
      ? "Connecting"
      : state === "error"
      ? "Tunnel Error"
      : "Expose Online";

  const title =
    state === "connected"
      ? `Publicly reachable at ${tunnelStatus?.public_host} - click to disable`
      : state === "connecting"
      ? `Connecting to ${tunnelStatus?.server || "the tunnel server"} - click to cancel`
      : state === "error"
      ? `${tunnelStatus?.error || "Tunnel failed"} - click to retry`
      : "Get a public URL for this webhook endpoint";

  return (
    <Button
      variant={"outline"}
      className={cn(
        "hover:cursor-pointer",
        state === "connected" &&
          "border-green-300 text-green-600 hover:text-green-700",
        state === "error" && "border-red-300 text-red-600 hover:text-red-700"
      )}
      onClick={handleClick}
      disabled={busy}
      title={title}
    >
      {state === "connecting" ? (
        <LoaderCircle className="animate-spin" />
      ) : (
        <Globe />
      )}
      {label}
    </Button>
  );
};
