import { Plus } from "lucide-react";
import { useState } from "react";
import { BrandColorSwatch } from "./brand-color-swatch";

const MAX_COLORS = 8;
const NEW_COLOR_DEFAULT = "#a3e635";

// Estado só local por enquanto; ainda não há endpoint para persistir a paleta.
export function BrandColors() {
  const [colors, setColors] = useState<string[]>(["#a3e635", "#18181b"]);

  const canAddColor = colors.length < MAX_COLORS;

  function handleAddColor() {
    setColors((prev) => [...prev, NEW_COLOR_DEFAULT]);
  }

  function handleChangeColor(index: number, color: string) {
    setColors((prev) => prev.map((item, i) => (i === index ? color : item)));
  }

  function handleRemoveColor(index: number) {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {colors.map((color, index) => (
          <BrandColorSwatch
            // biome-ignore lint/suspicious/noArrayIndexKey: a cor é editável, então não serve de chave
            key={index}
            color={color}
            onChange={(value) => handleChangeColor(index, value)}
            onRemove={() => handleRemoveColor(index)}
          />
        ))}

        {canAddColor && (
          <button
            type="button"
            aria-label="Add color"
            onClick={handleAddColor}
            className="flex size-14 items-center justify-center rounded-xl border border-dashed text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Plus className="size-5" />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {colors.length}/{MAX_COLORS} colors · click a swatch to edit it
      </p>
    </div>
  );
}
