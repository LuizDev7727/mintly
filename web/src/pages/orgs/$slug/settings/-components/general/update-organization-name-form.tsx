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

export function UpdateOrganizationNameForm() {
  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Organization Name</CardTitle>
        <CardDescription>
          This is your organization's visible name within Mintly.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Input placeholder="Organization name" className="max-w-sm" />
      </CardContent>
      <CardFooter className="border-t justify-between">
        <p className="text-sm text-muted-foreground">Maximum 32 characters.</p>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  );
}
