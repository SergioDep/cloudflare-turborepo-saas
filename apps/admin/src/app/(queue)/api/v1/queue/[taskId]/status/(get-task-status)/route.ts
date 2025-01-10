import { NextRequest } from "next/server";
import { withErrorHandler } from "@/modules/base/lib/utils/with-error-handler";
import { getTaskStatusAction } from "@/modules/queue/server/actions/get-task-status";

export const runtime = "edge";

export const GET = withErrorHandler(
  async (request: NextRequest, { params }: { params: { taskId: string } }) => {
    const taskId = params.taskId;

    return Response.json(
      {
        success: true,
        data: await getTaskStatusAction({ taskId }),
      },
      {
        status: 200,
      },
    );
  },
);
