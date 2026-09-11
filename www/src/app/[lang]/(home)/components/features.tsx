import { BarChart3, CalendarClock, Layers, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const icons = [CalendarClock, Layers, BarChart3, Users];

type FeaturesDict = {
  title: string;
  subtitle: string;
  items: { title: string; description: string }[];
};

export function Features({ dict }: { dict: FeaturesDict }) {
  return (
    <section className="border-t border-border bg-card/40 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {dict.title}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {dict.subtitle}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dict.items.map((feature, index) => {
            const Icon = icons[index];
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
