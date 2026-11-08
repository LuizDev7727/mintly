import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerHexInput,
  ColorPickerHue,
  ColorPickerTrigger,
} from "./color-picker";
import { Button } from "@/components/ui/button";
import { deleteColorHttp } from "@/http/color/delete-color.http";

interface BrandColorItemProps {
  colorId: string;
  hex: string;
}

export function BrandColorItem({ colorId, hex }: BrandColorItemProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

  const { mutate: deleteColor, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      deleteColorHttp({ orgSlug: slug, channelId: channel, colorId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["colors", channel] }),
  });

  return (
    <ColorPicker aria-label={`Brand color ${hex}`} value={hex} alpha={false}>
      <ColorPickerTrigger />
      <ColorPickerContent>
        <ColorPickerArea />
        <ColorPickerHue />
        <ColorPickerHexInput />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          className="w-full text-destructive hover:text-destructive"
          onClick={() => deleteColor()}
        >
          <Trash2 />
          Remove color
        </Button>
      </ColorPickerContent>
    </ColorPicker>
  );
}
