import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Layers,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        name: "description",
        content:
          "Mintly connects your channels, organizes your content, and tracks growth — all in one place.",
      },
      { title: "Home | Mintly" },
    ],
  }),
  component: HomePage,
});

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

function HomePage() {
  return (
    <div className="w-full">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-medium">
            Mintly
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/auth/sign-up">
                Get started
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
            Schedule, publish, and track your content across every channel
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Mintly connects your channels, organizes your content, and tracks
            growth — all in one place.
          </p>

          <Button size="lg" asChild>
            <Link to="/auth/sign-up">
              Get started for free
              <ArrowRight />
            </Link>
          </Button>
        </section>

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

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary px-8 py-16 text-center">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              Ready to bring your content workflow together?
            </h2>
            <p className="max-w-md text-zinc-800">
              Create your free account and start scheduling in minutes.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth/sign-up">
                Create your account
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="size-5" />
            Mintly Inc.
          </div>
          <p>© {new Date().getFullYear()} Mintly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
