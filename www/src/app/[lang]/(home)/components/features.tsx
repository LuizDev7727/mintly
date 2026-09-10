import { BarChart3, CalendarClock, Layers, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: CalendarClock,
    title: "Schedule & publish",
    description:
      "Plan your content calendar once and let Mintly publish across every channel at exactly the right time.",
  },
  {
    icon: Layers,
    title: "Organize everything",
    description:
      "Keep drafts, assets, and approvals in one workspace instead of scattered across a dozen tools.",
  },
  {
    icon: BarChart3,
    title: "Track growth",
    description:
      "See what's working with clear analytics on reach, engagement, and audience growth over time.",
  },
  {
    icon: Users,
    title: "Built for teams",
    description:
      "Invite teammates, assign roles, and collaborate on content without stepping on each other's work.",
  },
];

export function Features() {
  return (
    <section className="border-t border-border bg-card/40 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to grow your content
          </h2>
          <p className="mt-3 text-muted-foreground">
            From planning to publishing to reporting, Mintly keeps your
            whole content workflow in sync.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
