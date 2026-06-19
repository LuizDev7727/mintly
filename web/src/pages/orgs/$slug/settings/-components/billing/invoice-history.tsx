import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InvoiceStatus = "paid" | "pending" | "failed";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: InvoiceStatus;
}

const INVOICES: Invoice[] = [
  { id: "INV-006", date: "Jun 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-005", date: "May 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-004", date: "Apr 1, 2026", amount: "$29.00", status: "failed" },
  { id: "INV-003", date: "Mar 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-002", date: "Feb 1, 2026", amount: "$29.00", status: "paid" },
  { id: "INV-001", date: "Jan 1, 2026", amount: "$29.00", status: "paid" },
];

const statusConfig: Record<InvoiceStatus, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  paid: { label: "Paid", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
};

export function InvoiceHistory() {
  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Invoice History</CardTitle>
        <CardDescription>
          Download or review your past invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6">Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES.map((invoice) => {
              const { label, variant } = statusConfig[invoice.status];
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="px-6 font-medium">
                    {invoice.id}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.date}
                  </TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant={variant}>{label}</Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon-sm">
                      <Download className="size-4" />
                      <span className="sr-only">Download {invoice.id}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
