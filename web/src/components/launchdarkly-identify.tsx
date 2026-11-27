import { useEffect } from "react";
import { useLDClient } from "@launchdarkly/react-sdk";
import { useParams } from "@tanstack/react-router";

export function LaunchDarklyIdentify() {
  const client = useLDClient();

  const { slug } = useParams({
    from: "/orgs/$slug"
  })

  useEffect(() => {

    client.identify({
      kind: "multi",
      // user: {
      //   key: userId
      // },
      organization: {
        key: slug,
        slug
      },
    });
  }, [client, slug]);

  return null;
}
