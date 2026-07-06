import { z } from "zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpdateOrganizationAvatar } from "./-components/general/update-organization-avatar";
import { UpdateOrganizationNameForm } from "./-components/general/update-organization-name-form";
import { DeleteOrganization } from "./-components/general/delete-organization";
import { LeaveOrganization } from "./-components/general/leave-organization";
import { BillingEmailForm } from "./-components/billing/billing-email-form";
import { PaymentMethod } from "./-components/billing/payment-method";
import { InvoiceHistory } from "./-components/billing/invoice-history";

const settingsSearchSchema = z.object({
  tab: z.enum(["general", "billing"]).default("general"),
});

export const Route = createFileRoute("/orgs/$slug/settings/")({
  head: () => ({
    meta: [
      { title: "Settings | Mintly" },
      { name: "description", content: "Organization settings." },
    ],
  }),
  validateSearch: settingsSearchSchema,
  component: SettingsPage,
});

const navItems = [
  { id: "general", label: "General", icon: Settings },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

function SettingsPage() {
  const { slug } = Route.useParams();
  const { tab } = Route.useSearch();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <nav className="flex gap-0.5 overflow-x-auto md:w-44 md:shrink-0 md:flex-col md:overflow-visible">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              to="/orgs/$slug/settings"
              params={{ slug }}
              search={{ tab: id }}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                tab === id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {tab === "general" && <GeneralTab />}
          {tab === "billing" && <BillingTab />}
        </div>
      </div>
    </div>
  );
}

function GeneralTab() {
  return (
    <>
      <UpdateOrganizationAvatar />
      <UpdateOrganizationNameForm />
      <LeaveOrganization />
      <DeleteOrganization />
    </>
  );
}

function BillingTab() {
  return (
    <>
      <BillingEmailForm />
      <PaymentMethod />
      <InvoiceHistory />
    </>
  );
}
