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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/get-initials";

type UpdateOrganizationAvatarProps = {
  name: string;
  avatarUrl: string | null;
};

export function UpdateOrganizationAvatar({
  name,
  avatarUrl,
}: UpdateOrganizationAvatarProps) {
  // State to store the desired crop area in pixels

  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemove() {
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Avatar</CardTitle>
        <CardDescription>
          This is your organization's avatar. It will be displayed across
          Mintly.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4 pt-6">
        <Avatar className="size-14 rounded-lg">
          <AvatarImage src={previewUrl ?? undefined} />
          <AvatarFallback className="rounded-lg text-base">
            {getInitials(name)}
          </AvatarFallback>
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
          {previewUrl && (
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
        <Button size="sm" disabled={!previewUrl}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
