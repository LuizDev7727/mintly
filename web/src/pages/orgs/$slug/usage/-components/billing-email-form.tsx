import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type UpdateBillingEmailFormType,
  updateBillingEmailSchema,
} from "@/schemas/organization/update-billing-email.schema";

export function BillingEmailForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateBillingEmailFormType>({
    resolver: zodResolver(updateBillingEmailSchema),
    defaultValues: { email: "" },
  });

  async function handleSubmitBillingEmail(
    formBody: UpdateBillingEmailFormType,
  ) {
    const { email } = formBody;
    // TODO: chamar o endpoint de atualização do e-mail de cobrança quando existir.
    void email;
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitBillingEmail)}
      className="flex h-full flex-col gap-5 rounded-xl border border-border bg-card dark:bg-zinc-900/20 p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-primary">
          <MailIcon className="size-4" />
        </div>
        <div>
          <h2 className="text-base font-medium">Billing email</h2>
          <p className="text-sm text-muted-foreground">
            Invoices and payment receipts are sent to this address.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="billing-email">Email address</Label>
        <div className="relative">
          <MailIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="billing-email"
            type="email"
            placeholder="billing@company.com"
            className="pl-8"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </div>
        {errors.email ? (
          <FieldError>{errors.email.message}</FieldError>
        ) : (
          <p className="text-xs text-muted-foreground">
            This can be different from your account email.
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="mt-auto w-full"
        disabled
      >
        Save changes
      </Button>
    </form>
  );
}
