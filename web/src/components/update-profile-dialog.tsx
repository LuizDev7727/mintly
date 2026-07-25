import { useState } from "react";
import { UserPenIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";

type UpdateProfileDialogProps = {
  name: string;
  logo: string | null;
  bio: string | null;
}

export function UpdateProfileDialog({ name, logo, bio }: UpdateProfileDialogProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <Dialog onOpenChange={setIsEditProfileOpen} open={isEditProfileOpen}>
      <DialogTrigger className="cursor-pointer" asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <UserPenIcon />
          <span>Edit profile</span>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5"
      >
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. You can change your photo,
          name and biography.
        </DialogDescription>
        <UpdateProfileForm
          bio={bio}
          logo={logo}
          name={name}
        />
      </DialogContent>
    </Dialog>
  );
}
