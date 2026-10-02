import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type UpdateSpendingLimitFormType,
  updateSpendingLimitSchema,
} from "@/schemas/organization/update-spending-limit.schema";

type SpendingLimitFormProps = {
  currentLimit: number | null;
  onSave: (limit: number | null) => void;
};

export function SpendingLimitForm({
  currentLimit,
  onSave,
}: SpendingLimitFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateSpendingLimitFormType>({
    resolver: zodResolver(updateSpendingLimitSchema),
    defaultValues: {
      spendingLimit: currentLimit === null ? "" : String(currentLimit),
    },
  });

  function handleSubmitSpendingLimit(formBody: UpdateSpendingLimitFormType) {
    const { spendingLimit } = formBody;
    onSave(spendingLimit.trim() === "" ? null : Number(spendingLimit));
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitSpendingLimit)}>
      <div className="space-y-2 px-6 py-5">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Unlimited"
            className="pl-6"
            {...register("spendingLimit")}
          />
        </div>
        {errors.spendingLimit && (
          <FieldError>{errors.spendingLimit.message}</FieldError>
        )}
        <p className="text-xs text-muted-foreground">
          Leave empty to allow unlimited spending.
        </p>
      </div>
      <DialogFooter className="border-t px-6 py-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          Save limit
        </Button>
      </DialogFooter>
    </form>
  );
}
