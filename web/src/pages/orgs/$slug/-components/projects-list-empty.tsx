import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Cloud } from "lucide-react";

export function ProjectsListEmpty() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Cloud />
        </EmptyMedia>
        <EmptyTitle>Projects Empty</EmptyTitle>
        <EmptyDescription>
          No projects found. Create a project to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateProjectDialog />
      </EmptyContent>
    </Empty>
  );
}
