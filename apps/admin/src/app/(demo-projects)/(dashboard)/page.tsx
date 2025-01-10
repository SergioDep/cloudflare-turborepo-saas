import MagicText from "@/modules/base/components/ui-extended/magic-text";
import { ProjectOverviewCard } from "@/modules/demo-projects/components/dashboard/ProjectOverviewCard";
import { StatCard } from "@/modules/demo-projects/components/dashboard/StatCard";
import { projects } from "@/modules/demo-projects/lib/config/projects";
import { LucideCheckCircle, LucideFileBox, LucideFilter } from "lucide-react";

import { Card, CardContent } from "@repo/ui/components/card";

export const runtime = "edge";

export default async function Page() {
  return (
    <main className="relative flex h-full flex-1 flex-col gap-4 overflow-y-auto p-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold md:text-3xl">
          <span>
            Welcome to The <MagicText text="Command Center" />
          </span>
        </h1>
        <p className="mt-2 text-foreground/60">
          Manage and access your business tools efficiently.
        </p>
      </div>
      <section id="tools" className="w-full">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<LucideFileBox className="h-6 w-6 text-primary" />}
            title="Active Projects"
            value={projects.length.toString()}
          />
          <StatCard
            icon={<LucideCheckCircle className="h-6 w-6 text-success" />}
            title="Active Tools"
            value={projects.flatMap((p) => p.tools).length.toString()}
          />
          <StatCard
            icon={<LucideFilter className="h-6 w-6 text-destructive" />}
            title="Pending Tasks"
            value="24"
          />
        </div>
      </section>
      <section className="w-full">
        <h2 className="mb-4 text-2xl font-bold">Projects Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectOverviewCard
              key={project.id}
              id={project.id}
              title={project.name}
              description={project.description}
              status={project.status}
              badgeVariant={
                project.status === "Active"
                  ? "success"
                  : project.status === "In Progress"
                    ? "warning"
                    : project.status === "Inactive"
                      ? "destructive"
                      : "secondary"
              }
            />
          ))}
        </div>
      </section>
      <section className="w-full">
        <h2 className="mb-4 text-2xl font-bold">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              <ActivityItem
                action="Deployed update for Project Alpha."
                time="5 min ago"
              />
              <ActivityItem
                action="Client added to Project Beta."
                time="1 hr ago"
              />
              <ActivityItem
                action="Generated new license for Project Gamma."
                time="3 hrs ago"
              />
              <ActivityItem
                action="Domain created for Project Delta."
                time="1 day ago"
              />
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ActivityItem({ action, time }: { action: string; time: string }) {
  return (
    <li className="px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground/60">{action}</p>
        <p className="text-sm text-foreground">{time}</p>
      </div>
    </li>
  );
}
