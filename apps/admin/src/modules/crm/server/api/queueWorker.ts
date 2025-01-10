import { crmHC } from "@repo/queue-worker/modules/crm/hc";
import { AppError } from "@repo/validators/modules/base/app-error";

const client = crmHC(process.env.MY_QUEUE_WORKER_BASE_URL);

export const crmQueueWorker = {
  createDataSyncTask: async (
    ...args: Parameters<(typeof client)["sync-data"]["create"]["$post"]>
  ) => {
    const response = await client["sync-data"]["create"].$post(...args);

    const json = await response.json();
    if (response.ok) {
      return json;
    }

    throw new AppError("base.api.unknown-error", {
      message: "Failed to create data sync task",
      details: {
        data: json,
      },
    });
  },
  syncDataChunk: async (
    ...args: Parameters<(typeof client)["sync-data"]["add-data-chunk"]["$post"]>
  ) => {
    const response = await client["sync-data"]["add-data-chunk"].$post(...args);

    const json = await response.json();
    if (response.ok) {
      return json;
    }

    throw new AppError("base.api.unknown-error", {
      message: "Failed to sync data chunk",
      details: {
        data: json,
      },
    });
  },
};
