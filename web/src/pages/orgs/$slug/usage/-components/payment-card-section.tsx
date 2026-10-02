import { Nfc, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentCardEmpty } from "./payment-card-empty";
import { SpendingLimitDialog } from "./spending-limit-dialog";

const METER_BARS = 40;

// TODO: remover — dados fictícios só para o layout da seção.
const MOCK_HAS_PAYMENT_CARD = true;

const MOCK_CARD = {
  number: "3110 2322 2342 1123",
  holderName: "Lily Rose",
  expiresAt: "11/30",
};

const MOCK_SPENT = 248.65;
const MOCK_INITIAL_SPENDING_LIMIT: number | null = 500;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Seção com o cartão de pagamento da organização e o gasto contra o limite definido pelo usuário para o app. */
export function PaymentCardSection() {
  const [spendingLimit, setSpendingLimit] = useState<number | null>(
    MOCK_INITIAL_SPENDING_LIMIT,
  );

  const spent = MOCK_SPENT;
  const hasSpendingLimit = spendingLimit !== null;
  const filledBars = hasSpendingLimit
    ? Math.min(METER_BARS, Math.round((spent / spendingLimit) * METER_BARS))
    : 0;

  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card/40 dark:bg-zinc-900/20 p-5">
      <div className="relative space-y-5">
        <header className="flex items-center justify-between">
          <h2 className="text-base font-medium">My Cards</h2>
          <Button variant="outline" disabled>
            <Plus className="size-4" />
            Add Card
          </Button>
        </header>

        {MOCK_HAS_PAYMENT_CARD ? (
          <div className="relative flex aspect-[1.75] w-96 max-w-full flex-col justify-between overflow-hidden rounded-xl border border-primary/20 bg-linear-to-br from-zinc-900 via-zinc-950 to-black p-5 shadow-lg">
            <div className="pointer-events-none absolute -right-10 -bottom-12 size-56 rounded-full bg-primary/25 blur-3xl" />
            <img
              src="/logo.svg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -bottom-6 w-44 -rotate-12 opacity-10"
            />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="" className="size-6" />
                <span className="text-base font-semibold tracking-tight text-primary">
                  mintly
                </span>
              </div>
              <Nfc className="size-5 text-primary/70" />
            </div>

            <div className="relative space-y-3">
              <div
                className="flex -space-x-2"
                role="img"
                aria-label="Mastercard"
              >
                <span className="size-5 rounded-full bg-red-500" />
                <span className="size-5 rounded-full bg-amber-400/90 mix-blend-screen" />
              </div>
              <p className="font-mono text-lg tracking-[0.2em] text-zinc-100 tabular-nums">
                {MOCK_CARD.number}
              </p>
            </div>

            <div className="relative flex gap-8">
              <div className="space-y-0.5">
                <p className="text-[10px] tracking-wider text-zinc-500 uppercase">
                  Card Holder
                </p>
                <p className="text-sm font-medium text-zinc-100">
                  {MOCK_CARD.holderName}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] tracking-wider text-zinc-500 uppercase">
                  Expires
                </p>
                <p className="text-sm font-medium text-zinc-100">
                  {MOCK_CARD.expiresAt}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <PaymentCardEmpty />
        )}

        <div className="space-y-4 border-t border-border/60 pt-5">
          <h3 className="text-base font-medium">Spending</h3>

          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {currencyFormatter.format(spent)}
            </p>
          </div>

          <div
            className="flex h-12 items-stretch gap-1"
            role="meter"
            aria-label="Spending against spending limit"
            aria-valuemin={0}
            aria-valuemax={spendingLimit ?? undefined}
            aria-valuenow={spent}
          >
            {Array.from({ length: METER_BARS }, (_, index) => (
              <span
                key={index}
                data-filled={index < filledBars}
                className="flex-1 rounded-full bg-muted data-[filled=true]:bg-primary"
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 py-1.5 pr-1.5 pl-3">
            <p className="text-xs text-muted-foreground">
              Spending limit:{" "}
              {hasSpendingLimit ? (
                <>
                  <span className="font-medium text-foreground">
                    {currencyFormatter.format(spendingLimit)}
                  </span>
                  {" · "}
                  {currencyFormatter.format(Math.max(spendingLimit - spent, 0))}{" "}
                  remaining
                </>
              ) : (
                <span className="font-medium text-foreground">Unlimited</span>
              )}
            </p>
            <SpendingLimitDialog
              currentLimit={spendingLimit}
              onSave={setSpendingLimit}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
