import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmLeaveOrganizationDialog } from "./confirm-leave-organization-dialog";

export function LeaveOrganization() {
  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Leave Organization</CardTitle>
        <CardDescription>
          Remove yourself from this organization. You will lose access to all
          its resources immediately.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-between">
        <p className="text-sm text-muted-foreground">
          You can be re-invited by an admin later.
        </p>
        <ConfirmLeaveOrganizationDialog />
      </CardFooter>
    </Card>
  );
}
