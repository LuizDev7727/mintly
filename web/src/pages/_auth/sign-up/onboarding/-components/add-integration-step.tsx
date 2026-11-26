import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/provider-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getIntegrationsHttp } from "@/http/integration/get-integrations.http";
import { requestYoutubeIntegrationUrlHttp } from "@/http/integration/request-youtube-integration-url.http";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { IntegrationCard } from "./integration-card";

type AddIntegrationStepProps = {
  orgSlug: string;
  channelId: string;
};

type ConnectPhase = "idle" | "connecting" | "popup-blocked" | "failed";

const POLL_INTERVAL_MS = 2000;

export function AddIntegrationStep({
  orgSlug,
  channelId,
}: AddIntegrationStepProps) {
  const navigate = useNavigate();
  const popupRef = useRef<Window | null>(null);
  const [phase, setPhase] = useState<ConnectPhase>("idle");

  const {
    data,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["integrations", orgSlug, channelId],
    queryFn: () => getIntegrationsHttp({ orgSlug, channelId }),
    // The login happens in another tab: poll while waiting, and the default
    // refetchOnWindowFocus catches the user coming back to this tab.
    refetchInterval: phase === "connecting" ? POLL_INTERVAL_MS : false,
  });

  const { mutateAsync: requestUrl } = useMutation({
    mutationFn: requestYoutubeIntegrationUrlHttp,
    // The failure is shown by the card alert below, not by the global toast.
    onError: () => undefined,
  });

  const isYoutubeConnected =
    data?.integrations.some(
      (integration) => integration.provider === "YOUTUBE",
    ) ?? false;

  const isConnecting = phase === "connecting" && !isYoutubeConnected;

  // Tab closed before finishing the login: Google never calls back, so detect
  // it here, refetch once, and fall back to Connect without an error.
  useEffect(() => {
    if (phase !== "connecting") return;

    const interval = setInterval(async () => {
      if (popupRef.current?.closed) {
        clearInterval(interval);
        await refetch();
        setPhase("idle");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, refetch]);

  async function handleConnectYoutube() {
    // Must open synchronously in the click or the browser blocks the pop-up.
    const popup = window.open("about:blank");

    if (popup === null) {
      setPhase("popup-blocked");
      return;
    }

    popupRef.current = popup;
    setPhase("connecting");

    try {
      const { url } = await requestUrl({
        orgSlug,
        channelId,
        source: "onboarding",
      });
      popup.location.href = url;
    } catch {
      popup.close();
      setPhase("failed");
    }
  }

  function handleFinish() {
    navigate({ to: "/orgs" });
  }

  if (isPending) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn't load your integrations</AlertTitle>
        <AlertDescription>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const youtubeState = isYoutubeConnected
    ? "connected"
    : isConnecting
      ? "connecting"
      : "default";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <IntegrationCard
          name="YouTube"
          icon={<YoutubeIcon className="size-5" />}
          state={youtubeState}
          onConnect={handleConnectYoutube}
        />
        <IntegrationCard
          name="TikTok"
          icon={<TiktokIcon className="size-5" />}
          state="coming-soon"
        />
        <IntegrationCard
          name="Instagram"
          icon={<InstagramIcon className="size-5" />}
          state="coming-soon"
        />
      </div>

      {phase === "popup-blocked" && !isYoutubeConnected && (
        <Alert variant="destructive">
          <AlertTitle>Couldn't open the sign-in tab</AlertTitle>
          <AlertDescription>
            Your browser blocked the pop-up. Allow pop-ups for Mintly and try
            again.
          </AlertDescription>
        </Alert>
      )}

      {phase === "failed" && !isYoutubeConnected && (
        <Alert variant="destructive">
          <AlertTitle>Couldn't connect YouTube</AlertTitle>
          <AlertDescription>
            Something went wrong while starting the sign-in. Try again.
          </AlertDescription>
        </Alert>
      )}

      <Button
        className="w-full"
        disabled={!isYoutubeConnected}
        onClick={handleFinish}
      >
        Finish setup
      </Button>
    </div>
  );
}
