import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i;

interface BrandColorSwatchProps {
  color: string;
  onChange: (color: string) => void;
  onRemove: () => void;
}

export function BrandColorSwatch({
  color,
  onChange,
  onRemove,
}: BrandColorSwatchProps) {
  const [hexDraft, setHexDraft] = useState(color);

  function handleHexChange(value: string) {
    const normalized = value.startsWith("#") ? value : `#${value}`;
    setHexDraft(normalized);

    if (HEX_COLOR_REGEX.test(normalized)) {
      onChange(normalized.toLowerCase());
    }
  }

  function handlePickerChange(value: string) {
    setHexDraft(value);
    onChange(value);
  }

  return (
    <Popover onOpenChange={(open) => open && setHexDraft(color)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Edit color ${color}`}
          style={{ backgroundColor: color }}
          className="size-14 shrink-0 rounded-xl border shadow-xs transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3" align="start">
        <div className="space-y-1.5">
          <Label htmlFor={`picker-${color}`}>Pick a color</Label>
          <input
            id={`picker-${color}`}
            type="color"
            value={color}
            onChange={(event) => handlePickerChange(event.target.value)}
            className="h-24 w-full cursor-pointer rounded-md border bg-transparent p-0"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`hex-${color}`}>Hex</Label>
          <Input
            id={`hex-${color}`}
            value={hexDraft}
            maxLength={7}
            spellCheck={false}
            aria-invalid={!HEX_COLOR_REGEX.test(hexDraft)}
            onChange={(event) => handleHexChange(event.target.value)}
            className="font-mono uppercase"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 />
          Remove color
        </Button>
      </PopoverContent>
    </Popover>
  );
}
