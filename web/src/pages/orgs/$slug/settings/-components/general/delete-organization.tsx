import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDeleteOrganizationDialog } from "./confirm-delete-organization-dialog";

export function DeleteOrganization() {
  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Delete Organization</CardTitle>
        <CardDescription>
          This will permanently delete your organization. This action is
          irreversible, so proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardFooter className="border-t justify-between">
        <p className="text-sm text-destructive">This action cannot be undone!</p>
        <ConfirmDeleteOrganizationDialog />
      </CardFooter>
    </Card>
  );
}
