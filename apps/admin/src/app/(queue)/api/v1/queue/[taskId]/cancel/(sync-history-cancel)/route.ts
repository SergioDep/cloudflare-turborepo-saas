import { NextRequest } from "next/server";
import { withErrorHandler } from "@/modules/base/lib/utils/with-error-handler";
import { cancelTaskAction } from "@/modules/queue/server/actions/cancel-task";

export const runtime = "edge";

export const POST = withErrorHandler(
  async (request: NextRequest, { params }: { params: { taskId: string } }) => {
    const taskId = params.taskId;
    // const payload = await request.json();

    return Response.json(
      {
        success: true,
        data: await cancelTaskAction({
          taskId,
        }),
      },
      {
        status: 200,
      },
    );
  },
);
