import type { SelectQueueTasksModel } from "@repo/db/modules/queue/schema/tasks";
import type { BaseMessageBody } from "@repo/queue-worker/modules/queue/lib/types";
import type {
  ExtractRecursiveIds,
  FindRecursivePropValue,
} from "@repo/validators/modules/base/utils";

interface MessageDefinitions {
  _: {
    id: "sync-data";
    // message: [never];
    message: {
      accountId: string;
      userId: string | null;
    };
    items: [
      {
        id: "data-chunk";
        message: {
          accountId: string;
          chunkId: string;
          parentTaskId: SelectQueueTasksModel["parentTaskId"];
        };
      },
    ];
  };
}

type AllMessageTypes = ExtractRecursiveIds<MessageDefinitions, "message">;

type ExtractMessageData<P extends AllMessageTypes> = FindRecursivePropValue<
  MessageDefinitions[keyof MessageDefinitions],
  P,
  "message"
>;

type FlattenAllMessageDefinitions = {
  [M in AllMessageTypes]: BaseMessageBody<M, ExtractMessageData<M>>;
};

// Augment the AllQueueMessages interface with crm messages
declare module "@repo/queue-worker/modules/queue/lib/types" {
  interface AllQueueMessages extends FlattenAllMessageDefinitions {}
}
