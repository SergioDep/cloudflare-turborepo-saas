import { queueHC } from "@repo/queue-worker/modules/queue/hc";
import { AppError } from "@repo/validators/modules/base/app-error";

const client = queueHC(process.env.MY_QUEUE_WORKER_BASE_URL);

export const queueQueueWorker = {
  getTaskStatus: async (
    ...args: Parameters<(typeof client)["status"][":taskId"]["$get"]>
  ) => {
    const response = await client["status"][":taskId"].$get(...args);

    const json = await response.json();
    if (response.ok) {
      return json;
    }

    throw new AppError("base.api.unknown-error", {
      message: "Failed to get sync status",
      details: {
        data: json,
      },
    });
  },

  cancelTask: async (
    ...args: Parameters<(typeof client)["cancel"]["$post"]>
  ) => {
    const response = await client["cancel"].$post(...args);

    const json = await response.json();
    if (response.ok) {
      return json;
    }

    throw new AppError("base.api.unknown-error", {
      message: "Failed to cancel sync",
      details: {
        data: json,
      },
    });
  },

  startTask: async (...args: Parameters<(typeof client)["start"]["$post"]>) => {
    const response = await client["start"].$post(...args);

    const json = await response.json();
    if (response.ok) {
      return json;
    }

    throw new AppError("base.api.unknown-error", {
      message: "Failed to start sync",
      details: {
        data: json,
      },
    });
  },
};
