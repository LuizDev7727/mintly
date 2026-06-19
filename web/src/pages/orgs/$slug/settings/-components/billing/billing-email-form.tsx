import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BillingEmailForm() {
  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Billing Email</CardTitle>
        <CardDescription>
          Invoices and payment receipts will be sent to this address.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Input
          type="email"
          placeholder="billing@company.com"
          className="max-w-sm"
        />
      </CardContent>
      <CardFooter className="border-t justify-between">
        <p className="text-sm text-muted-foreground">
          This can be different from your account email.
        </p>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  );
}
