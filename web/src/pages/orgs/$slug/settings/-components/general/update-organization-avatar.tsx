import { useRef, useState } from "react";
import { Save, Upload, X } from "lucide-react";
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
import { uploadFile } from "@/utils/upload-file";
import { Spinner } from "@/components/ui/spinner";
import { updateOrganizationHttp } from "@/http/organization/update-organization.http";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";

type UpdateOrganizationAvatarProps = {
  name: string;
  avatarUrl: string | null;
};

export function UpdateOrganizationAvatar({
  name,
  avatarUrl: initialAvatarUrl,
}: UpdateOrganizationAvatarProps) {

  const queryClient = useQueryClient()
  const { slug } = useParams({
    from: "/orgs/$slug",
  })
  // State to store the desired crop area in pixels

  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setFileSelected(file);
  }

  const { mutateAsync: updateOrganization } = useMutation({
    mutationFn: updateOrganizationHttp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-organization"] })
      toast("Organization avatar updated successfully")
    }
  })

  async function handleUpdateAvatar() {
    if (!fileSelected) {
      return;
    }

    setIsSaving(true);

    const { key } = await uploadFile({
      file: fileSelected,
      signal: new AbortController().signal,
      onProgress: (progress) => {
        const hasUploadCompleted = progress === 100;
        if (hasUploadCompleted) {
          setIsSaving(false);
        }
      },
    });

    await updateOrganization({ slug, name, avatarKey: key });
  }

  function handleRemove() {
    setFileSelected(null);
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
          {fileSelected && <AvatarImage src={URL.createObjectURL(fileSelected)} />}
          {!fileSelected && <AvatarImage src={initialAvatarUrl ?? undefined} />}
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
          {fileSelected && (
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
        <Button size="sm" disabled={!fileSelected} onClick={handleUpdateAvatar}>
          {
            isSaving ? <Spinner /> : <Save />
          }
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
