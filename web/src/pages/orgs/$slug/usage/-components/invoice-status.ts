export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "refunded"
  | "partially_refunded"
  | "void";

export const invoiceStatusConfig: Record<
  InvoiceStatus,
  {
    label: string;
    variant: "default" | "processing" | "canceled" | "destructive";
    className: string;
  }
> = {
  draft: {
    label: "Draft",
    variant: "processing",
    className: "border-amber-500/30",
  },
  pending: {
    label: "Pending",
    variant: "processing",
    className: "border-amber-500/30",
  },
  paid: {
    label: "Paid",
    variant: "default",
    className: "",
  },
  refunded: {
    label: "Refunded",
    variant: "canceled",
    className: "border-zinc-500/30",
  },
  partially_refunded: {
    label: "Partially refunded",
    variant: "canceled",
    className: "border-zinc-500/30",
  },
  void: {
    label: "Void",
    variant: "destructive",
    className: "border-destructive/30",
  },
};
