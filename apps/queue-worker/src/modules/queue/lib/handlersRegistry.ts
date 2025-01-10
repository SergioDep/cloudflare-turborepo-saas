import type {
  AllQueueMessages,
  QueueMessageType,
} from "@repo/queue-worker/modules/queue/lib/types";

export type QueueHandlerFunction<T extends QueueMessageType> = (
  message: Message<AllQueueMessages[T]>,
  env: Omit<CloudflareEnv, "MY_QUEUE"> & {
    MY_QUEUE: Queue<AllQueueMessages[QueueMessageType]>;
  },
) => Promise<void> | void;

export const queueHandlers: Partial<
  Record<QueueMessageType, QueueHandlerFunction<QueueMessageType>>
> = {};

/**
 * Registers a handler for a specific message type.
 * Throws an error if a handler for the type already exists.
 *
 * @param type - The message type to register the handler for.
 * @param queueHandler - The handler function for the message type.
 */
export function registerQueueHandler<T extends QueueMessageType>(
  type: T,
  queueHandler: QueueHandlerFunction<T>,
) {
  if (queueHandlers[type]) {
    throw new Error(`Handler for type "${type}" is already registered.`);
  }
  queueHandlers[type] = queueHandler as QueueHandlerFunction<QueueMessageType>;
}
