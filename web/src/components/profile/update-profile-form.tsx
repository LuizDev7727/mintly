import { useId, useRef, useState } from "react";
import { ImagePlusIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth";
import {
  updateProfileSchema,
  type UpdateProfileFormType,
} from "@/schemas/profile/update-profile.schema";
import { getInitials } from "@/utils/get-initials";
import { uploadFile } from "@/utils/upload-file";

const BIO_MAX_LENGTH = 160;

type ProfileAvatarProps = {
  name: string;
  logo: string | null;
  onFileSelected: (file: File) => void;
};

function ProfileAvatar({ name, logo, onFileSelected }: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const currentImage = previewUrl ?? logo;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  }

  function openFileDialog() {
    inputRef.current?.click();
  }

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-black/10 shadow-xs">
        {currentImage ? (
          <img
            alt="Profile"
            className="size-full object-cover"
            height={80}
            src={currentImage}
            width={80}
          />
        ) : (
          <span className="font-medium text-lg text-muted-foreground">
            {getInitials(name)}
          </span>
        )}
        <button
          aria-label="Change profile picture"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-[color,box-shadow] hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          onClick={openFileDialog}
          type="button"
        >
          <ImagePlusIcon aria-hidden="true" size={16} />
        </button>
      </div>
      <input
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />
    </div>
  );
}

type UpdateProfileFormProps = {
  name: string;
  logo: string | null;
  bio: string | null;
};

export function UpdateProfileForm({
  name,
  logo,
  bio,
}: UpdateProfileFormProps) {
  const id = useId();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormType>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name,
      bio: bio ?? "",
    },
  });

  const bioValue = watch("bio") ?? "";

  async function onSubmit(formBody: UpdateProfileFormType) {

    let image: string | undefined = undefined;

    if (avatarFile) {
      const { key } = await uploadFile({
        file: avatarFile,
        signal: new AbortController().signal,
        onProgress: () => {},
      });
      image = key;
    }

    await authClient.updateUser({
      name: formBody.name,
      bio: formBody.bio,
      ...(image ? { image } : {}),
    });

    toast("Profile updated successfully");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="overflow-y-auto">
        <div className="h-32">
          <div className="relative flex size-full items-center justify-center overflow-hidden bg-primary" />
        </div>
        <ProfileAvatar
          logo={logo}
          name={name}
          onFileSelected={setAvatarFile}
        />
        <div className="space-y-4 px-6 pt-4 pb-6">
          <Field>
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input
              id={`${id}-name`}
              placeholder="Matt Welsh"
              {...register("name")}
            />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>
          <Field>
            <Label htmlFor={`${id}-bio`}>Biography</Label>
            <Textarea
              aria-describedby={`${id}-bio-description`}
              id={`${id}-bio`}
              maxLength={BIO_MAX_LENGTH}
              placeholder="Write a few sentences about yourself"
              {...register("bio")}
            />
            <p
              aria-live="polite"
              className="mt-2 text-right text-muted-foreground text-xs"
              id={`${id}-bio-description`}
              role="status"
            >
              <span className="tabular-nums">
                {BIO_MAX_LENGTH - bioValue.length}
              </span>{" "}
              characters left
            </p>
            {errors.bio && <FieldError>{errors.bio.message}</FieldError>}
          </Field>
        </div>
      </div>
      <DialogFooter className="border-t px-6 py-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? <Spinner /> : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
