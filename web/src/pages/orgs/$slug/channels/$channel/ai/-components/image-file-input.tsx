import { Upload, X } from "lucide-react";
import { useEffect, useId, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface ImageFileInputProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

export function ImageFileInput({ file, onChange }: ImageFileInputProps) {
  const inputId = useId();
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const hasFile = previewUrl !== null;

  return (
    <div className="relative h-full min-h-72 w-full overflow-hidden rounded-lg border bg-card">
      {hasFile ? (
        <>
          <img
            src={previewUrl}
            alt="Selected example"
            className="size-full bg-black object-contain"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Remove file"
            className="absolute top-2 right-2"
            onClick={() => onChange(null)}
          >
            <X />
          </Button>
        </>
      ) : (
        <label
          htmlFor={inputId}
          className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-accent/40"
        >
          <Upload className="size-6" />
          <span>Select an image to use as an example</span>
          <span className="text-xs">PNG, JPG or WebP</span>
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          onChange(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
    </div>
  );
}
