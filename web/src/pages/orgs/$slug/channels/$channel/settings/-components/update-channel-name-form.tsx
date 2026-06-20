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

export function UpdateChannelNameForm() {
  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Channel Name</CardTitle>
        <CardDescription>
          This is your channel's visible name within Mintly.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Input placeholder="Channel name" className="max-w-sm" />
      </CardContent>
      <CardFooter className="justify-between border-t">
        <p className="text-sm text-muted-foreground">Maximum 32 characters.</p>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  );
}
