import { createFileRoute } from "@tanstack/react-router";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { ProjectsListLoading } from "./-components/projects-list-loading";
import { ProjectsList } from "./-components/projects-list";
import { Metrics } from "./-components/metrics";
import { MetricsLoading } from "./-components/metrics-loading";

export const Route = createFileRoute("/orgs/$slug/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Projects</h1>
        <CreateProjectDialog />
      </div>

      <Suspense fallback={<MetricsLoading />}>
        <Metrics />
      </Suspense>

      <Separator />

      <Suspense fallback={<ProjectsListLoading />}>
        <ProjectsList />
      </Suspense>
    </div>
  );
}
