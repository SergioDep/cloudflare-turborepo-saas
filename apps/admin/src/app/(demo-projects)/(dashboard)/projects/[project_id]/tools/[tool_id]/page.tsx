import { projects } from "@/modules/demo-projects/lib/config/projects";

export const runtime = "edge";

export default function Page({
  params,
}: {
  params: { project_id: string; tool_id: string };
}) {
  const tool = projects
    .find((p) => p.id === params.project_id)
    ?.tools.find((t) => t.id === params.tool_id);

  if (!tool) {
    return <div>Tool not found</div>;
  }
  if (!tool.page) {
    return (
      <main className="relative flex h-full flex-1 flex-col gap-4 overflow-y-auto p-4 lg:gap-6 lg:p-6">
        <div>
          You are viewing project with ID: {params.project_id} and tool with ID:{" "}
          {params.tool_id}
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex h-full flex-1 flex-col gap-4 overflow-y-auto p-4 lg:gap-6 lg:p-6">
      <tool.page />
    </main>
  );
}
