import type {
  InsertQueueTasksModel,
  SelectQueueTasksModel,
} from "@repo/db/modules/queue/schema/tasks";

export type BaseMessageBody<T extends QueueMessageType, P = never> = {
  type: T;
  taskId: SelectQueueTasksModel["id"];
} & ([P] extends [never] ? {} : P);

// This interface will be augmented by each module using declaration merging
export interface AllQueueMessages {}

// export type QueueMessageType = AllQueueMessages[keyof AllQueueMessages]["type"];
export type QueueMessageType = keyof AllQueueMessages;

export type InsertQueueTask<
  T extends keyof AllQueueMessages = keyof AllQueueMessages,
> = {
  [K in keyof AllQueueMessages]: Omit<
    InsertQueueTasksModel,
    "data" | "type"
  > & {
    type: K;
    data: Omit<AllQueueMessages[K], "type" | "taskId">;
  };
}[T];

export type SelectQueueTask<
  T extends keyof AllQueueMessages = keyof AllQueueMessages,
> = {
  [K in keyof AllQueueMessages]: Omit<
    SelectQueueTasksModel,
    "data" | "type"
  > & {
    type: K;
    data: Omit<AllQueueMessages[K], "type" | "taskId">;
  };
}[T];
