import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NoPaymentMethod } from "./no-payment-method";
import { PaymentMethodCard } from "./payment-method-card";
import { AddCreditCardForm } from "./add-credit-card-form";

interface SavedCard {
  id: string;
  last4: string;
  expiry: string;
}

const MOCK_CARDS: SavedCard[] = [
  { id: "1", last4: "1234", expiry: "06/2026" },
  { id: "2", last4: "5678", expiry: "11/2027" },
];

export function PaymentMethod() {
  const [defaultId, setDefaultId] = useState<string>(MOCK_CARDS[0].id);
  const cards = MOCK_CARDS;

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          Manage the payment method used for your subscription.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {cards.length === 0 ? (
          <NoPaymentMethod />
        ) : (
          cards.map((card) => (
            <PaymentMethodCard
              key={card.id}
              last4={card.last4}
              expiry={card.expiry}
              isDefault={card.id === defaultId}
              onSetDefault={() => setDefaultId(card.id)}
onRemove={() => {}}
            />
          ))
        )}
      </CardContent>
      <CardFooter className="border-t justify-end">
        <AddCreditCardForm />
      </CardFooter>
    </Card>
  );
}
