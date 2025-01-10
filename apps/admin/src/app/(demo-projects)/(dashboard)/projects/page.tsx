import ToolCard from "@/modules/demo-projects/components/dashboard/ToolCard";
import { projects } from "@/modules/demo-projects/lib/config/projects";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Badge } from "@repo/ui/components/badge";

export const runtime = "edge";

export default async function Page() {
  return (
    <main className="relative flex h-full flex-1 flex-col gap-4 overflow-y-auto p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold md:text-3xl">Projects</h1>
        <p className="primary-foreground/60 mt-2">
          Manage and access your business projects efficiently.
        </p>
      </div>
      <Accordion
        type="multiple"
        defaultValue={projects.map((project) => project.id)}
        className="w-full"
      >
        {projects.map((project) => (
          <AccordionItem key={project.id} value={project.id}>
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-semibold">{project.name}</h2>
                <Badge
                  variant={
                    project.status === "Active"
                      ? "success"
                      : project.status === "In Progress"
                        ? "warning"
                        : project.status === "Inactive"
                          ? "destructive"
                          : "secondary"
                  }
                >
                  <span>{project.status}</span>
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {project.tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    projectId={project.id}
                    icon={tool.icon}
                    badgeVariant={
                      tool.status === "Active"
                        ? "success"
                        : tool.status === "In Progress"
                          ? "warning"
                          : tool.status === "Inactive"
                            ? "destructive"
                            : tool.status === "Beta"
                              ? "magic"
                              : "secondary"
                    }
                    status={tool.status}
                    title={tool.name}
                    description={tool.description}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
