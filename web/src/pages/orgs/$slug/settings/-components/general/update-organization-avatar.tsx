import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export function UpdateOrganizationAvatar() {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  function handleRemove() {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Organization Avatar</CardTitle>
        <CardDescription>
          This is your organization's avatar. It will be displayed across
          Mintly.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4 pt-6">
        <Avatar className="size-14 rounded-lg">
          <AvatarImage src={preview ?? undefined} />
          <AvatarFallback className="rounded-lg text-base">M</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
            Upload
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X className="size-4" />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
      <CardFooter className="border-t justify-between">
        <p className="text-sm text-muted-foreground">
          Recommended: square image, at least 256×256px.
        </p>
        <Button size="sm" disabled={!preview}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
