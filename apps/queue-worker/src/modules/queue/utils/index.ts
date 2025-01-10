const QUEUE_RETRY_DELAY_SECONDS = 30;

export const calculateQueueRetryDelaySeconds = (_attempts: number) =>
  QUEUE_RETRY_DELAY_SECONDS;
