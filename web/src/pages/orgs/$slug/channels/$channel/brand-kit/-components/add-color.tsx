import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addColorHttp } from "@/http/color/add-color.http";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerHexInput,
  ColorPickerHue,
  ColorPickerTrigger,
} from "./color-picker";

const NEW_COLOR_DEFAULT = "#a3e635";

function hexToRgb(hex: string) {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

export function AddColor() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [hex, setHex] = useState(NEW_COLOR_DEFAULT);

  const { mutate: addColor, isPending: isAdding } = useMutation({
    mutationFn: () =>
      addColorHttp({
        orgSlug: slug,
        channelId: channel,
        ...hexToRgb(hex),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["colors", channel],
      });
      setIsOpen(false);
      setHex(NEW_COLOR_DEFAULT);
    },
  });

  return (
    <ColorPicker
      aria-label="New brand color"
      value={hex}
      onValueChange={setHex}
      alpha={false}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <ColorPickerTrigger>Add color</ColorPickerTrigger>
      <ColorPickerContent>
        <ColorPickerArea />
        <ColorPickerHue />
        <ColorPickerHexInput />
        <Button
          type="button"
          size="sm"
          disabled={isAdding}
          className="w-full"
          onClick={() => addColor()}
        >
          <Plus />
          Add color
        </Button>
      </ColorPickerContent>
    </ColorPicker>
  );
}
