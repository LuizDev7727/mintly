import { useId } from "react";
import { CreditCard, Plus, WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddCreditCardForm() {
  const id = useId();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" />
          Add payment method
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <div
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
          >
            <WalletIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">Add a new card</DialogTitle>
            <DialogDescription className="text-left">
              Your card details are encrypted and stored securely.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="*:not-first:mt-2">
              <Label htmlFor={`name-${id}`}>Name on card</Label>
              <Input id={`name-${id}`} required type="text" />
            </div>
            <div className="*:not-first:mt-2">
              <Label htmlFor={`number-${id}`}>Card number</Label>
              <div className="relative">
                <Input
                  id={`number-${id}`}
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className="pe-9"
                />
                <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80">
                  <CreditCard size={16} aria-hidden="true" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`expiry-${id}`}>Expiry date</Label>
                <Input
                  id={`expiry-${id}`}
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="MM/YY"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`cvc-${id}`}>CVC</Label>
                <Input
                  id={`cvc-${id}`}
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="123"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`primary-${id}`} />
            <Label
              className="font-normal text-muted-foreground"
              htmlFor={`primary-${id}`}
            >
              Set as default payment method
            </Label>
          </div>
          <Button className="w-full" type="submit">
            Add card
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
