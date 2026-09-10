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
import { AddPaymentMethod } from "./add-payment-method";
import { PaymentMethodsPagination } from "./payment-methods-pagination";
import { getPaymentMethodsHttp } from "@/http/organization/get-payment-methods.http";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";

export function PaymentMethod() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const [currentPage] = useQueryState(
    "payment_method_page",
    parseAsInteger.withDefault(0),
  );

  const { data, isLoading } = useQuery({
    queryKey: ["payment-methods", slug, currentPage],
    queryFn: () =>
      getPaymentMethodsHttp({ orgSlug: slug, pageIndex: currentPage }),
    placeholderData: keepPreviousData,
  });

  const cards = data?.paymentMethods ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const isEmpty = !isLoading && cards.length === 0;

  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          Manage the payment method used for your subscription.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading payment methods...
          </p>
        )}
        {isEmpty && <NoPaymentMethod />}
        {cards.map((card) => (
          <PaymentMethodCard
            key={card.id}
            last4={card.last4}
            expiry={`${String(card.expMonth).padStart(2, "0")}/${card.expYear}`}
            isDefault={card.isDefault}
          />
        ))}
      </CardContent>
      {totalPages > 1 && (
        <div className="flex justify-end px-6">
          <PaymentMethodsPagination totalPages={totalPages} />
        </div>
      )}
      <CardFooter className="border-t justify-end">
        <AddPaymentMethod />
      </CardFooter>
    </Card>
  );
}
