import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SpendingLimitForm } from "./spending-limit-form";

type SpendingLimitDialogProps = {
  currentLimit: number | null;
  onSave: (limit: number | null) => void;
};

/** Modal para definir quanto a organização pode gastar no app. Sem limite definido, o gasto é ilimitado. */
export function SpendingLimitDialog({
  currentLimit,
  onSave,
}: SpendingLimitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleSave(limit: number | null) {
    onSave(limit);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled>
          {currentLimit === null ? "Set limit" : "Edit limit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="border-b px-6 py-4 text-left">
          <DialogTitle className="text-base">Spending limit</DialogTitle>
          <DialogDescription>
            Set the maximum amount your organization can spend on Mintly. If
            you don't set one, spending is unlimited.
          </DialogDescription>
        </DialogHeader>
        <SpendingLimitForm currentLimit={currentLimit} onSave={handleSave} />
      </DialogContent>
    </Dialog>
  );
}
