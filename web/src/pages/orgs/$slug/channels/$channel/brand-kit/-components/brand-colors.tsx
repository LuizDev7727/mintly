import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { getColorsHttp } from "@/http/color/get-colors.http";
import { AddColor } from "./add-color";
import { BrandColorItem } from "./brand-color-item";

const MAX_COLORS = 5;

export function BrandColors() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const { data } = useSuspenseQuery({
    queryKey: ["colors", channel],
    queryFn: () => getColorsHttp({ orgSlug: slug, channelId: channel }),
  });

  const { colors } = data;

  const canAddColor = colors.length < MAX_COLORS;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {colors.map((color) => (
          <BrandColorItem key={color.id} colorId={color.id} hex={color.hex} />
        ))}

        {canAddColor && <AddColor />}
      </div>

      <p className="text-xs text-muted-foreground">
        {colors.length}/{MAX_COLORS} colors
      </p>
    </div>
  );
}
