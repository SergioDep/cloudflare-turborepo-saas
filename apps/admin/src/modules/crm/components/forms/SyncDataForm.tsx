"use client";

import { CSSProperties, useRef, useState } from "react";
import { createDataSyncAction } from "@/modules/crm/server/actions/create-data-sync";
import { syncDataChunkAction } from "@/modules/crm/server/actions/sync-data-chunk";
import { startTaskAction } from "@/modules/queue/server/actions/start-task";
import { useMutation } from "@tanstack/react-query";
import { CSVImporter } from "csv-import-react";
import { BarChart, MessageSquare, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { stringToJSONSchema } from "@repo/validators/modules/base/utils";
import { IncomingMessageSchema } from "@repo/validators/modules/crm/incoming-message";

const MAX_CHUNK_SIZE = 20000000; // Approx 20 MB in bytes

const DEMO_ACCOUNT_PHONE_NUMBER = "1234567890";

// Function to calculate size of JSON string
function getSizeInBytes(obj: object) {
  return new TextEncoder().encode(JSON.stringify(obj)).length;
}

interface ImportedCSVDataTemplate<Keys extends string> {
  columns: {
    key: Keys;
    name: string;
  }[];
  error: string | null;
  num_columns: number;
  num_rows: number;
  rows: {
    index: number;
    values: {
      [K in Keys]: string;
    };
  }[];
}

type ImportedCSVData = ImportedCSVDataTemplate<
  keyof (typeof IncomingMessageSchema)["shape"]
>;
type MessagesChunk = z.infer<typeof ParsedCSVDataSchema>[];

// The Schema should be the same as IncomingMessageSchema
const ParsedCSVDataSchema = IncomingMessageSchema.extend({
  message: stringToJSONSchema.pipe(IncomingMessageSchema.shape.message),
  messageType: z.preprocess(
    (val) => "text",
    IncomingMessageSchema.shape.messageType,
  ),
  messageTimestamp: z.coerce
    .number()
    .pipe(IncomingMessageSchema.shape.messageTimestamp),
});

type SyncStatus = {
  status: "idle" | "syncing" | "completed" | "error";
  progress: number;
  stats: {
    accounts: number;
    conversations: number;
    messagesProcessed: number;
    totalMessages: number;
  };
};

export function SyncDataForm() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: "idle",
    progress: 0,
    stats: {
      accounts: 0,
      conversations: 0,
      messagesProcessed: 0,
      totalMessages: 0,
    },
  });

  const [isImporterOpen, setIsImporterOpen] = useState(false);

  const importedCSVData = useRef<ImportedCSVData["rows"]>([]);

  const { mutateAsync: server_syncMessagesChunk } = useMutation({
    mutationFn: syncDataChunkAction,
  });

  const { mutateAsync: server_createDataSync } = useMutation({
    mutationFn: createDataSyncAction,
  });

  const { mutateAsync: server_startTask } = useMutation({
    mutationFn: startTaskAction,
  });

  async function processCSVData(dataToProcess: ImportedCSVData["rows"]) {
    // Split parsedData into chunks based on size
    const chunks: MessagesChunk[] = [];
    let currentChunk: MessagesChunk = [];
    let currentChunkSize = 0;

    const accountsSet = new Set<string>();
    const conversationsSet = new Set<string>();

    let processedMessages = 0;

    for (const row of dataToProcess) {
      const parsedRow = ParsedCSVDataSchema.parse(row.values);

      accountsSet.add(parsedRow.instanceId);
      conversationsSet.add(parsedRow.from); // TODO: This should be contactId

      const parsedRowSize = getSizeInBytes(parsedRow);

      if (
        currentChunkSize + parsedRowSize > MAX_CHUNK_SIZE &&
        currentChunk.length > 0
      ) {
        chunks.push([...currentChunk]);
        currentChunk = [];
        currentChunkSize = 0;
      }

      currentChunk.push(parsedRow);
      currentChunkSize += parsedRowSize;

      if (processedMessages % Math.ceil(dataToProcess.length / 100) === 0) {
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      setSyncStatus((prev) => ({
        ...prev,
        progress: Math.min(
          100,
          Math.floor((processedMessages / dataToProcess.length) * 100),
        ),
        stats: {
          ...prev.stats,
          accounts: accountsSet.size,
          conversations: conversationsSet.size,
          messagesProcessed: prev.stats.messagesProcessed + 1,
        },
      }));

      processedMessages++;
    }

    // Add the last chunk
    if (currentChunk.length > 0) {
      chunks.push([...currentChunk]);
    }

    toast.dismiss();
    toast.loading("Syncing messages with server...");

    const { taskId: parentTaskId } = await server_createDataSync({
      accountPhoneNumber: DEMO_ACCOUNT_PHONE_NUMBER,
    });

    await Promise.all(
      chunks.map((chunk, index) =>
        server_syncMessagesChunk({
          parentTaskId,
          chunkIndex: index,
          messages: chunk,
        }),
      ),
    );

    toast.dismiss();
    toast.loading("Sending data to the server...");

    await new Promise((resolve) => setTimeout(resolve, 100));

    await server_startTask({ taskId: parentTaskId });

    setSyncStatus((prev) => ({
      ...prev,
      status: "completed",
      progress: 100,
    }));

    toast.dismiss();
    toast.success("CSV imported successfully");
  }

  async function onImportedCSV(data: ImportedCSVData) {
    try {
      if (data.error) {
        console.error(data.error);
        return;
      }

      importedCSVData.current = data.rows;

      setIsImporterOpen(false);

      setSyncStatus({
        status: "syncing",
        progress: 0,
        stats: {
          accounts: 0,
          conversations: 0,
          messagesProcessed: 0,
          totalMessages: data.num_rows,
        },
      });

      await processCSVData(data.rows);
    } catch (e) {
      setIsImporterOpen(false);
      toast.dismiss();
      toast.error(
        "Error importing CSV: " + (e instanceof Error ? e.message : e),
      );
    }
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      {syncStatus.status !== "idle" && (
        <Card className="overflow-hidden rounded-2xl border-none bg-background shadow-xl">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white dark:from-teal-600 dark:to-emerald-700">
            <CardTitle className="text-2xl font-bold">Sync Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-600">
                <span>Overall Progress</span>
                <span>{syncStatus.progress}%</span>
              </div>
              <Progress
                value={syncStatus.progress}
                className="h-2 bg-gray-200 [&>*]:bg-gradient-to-r [&>*]:from-teal-500 [&>*]:to-emerald-600 [&>*]:dark:from-teal-600 [&>*]:dark:to-emerald-700"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Accounts
                  </CardTitle>
                  <Users className="h-8 w-8 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {syncStatus.stats.accounts.toString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversations
                  </CardTitle>
                  <MessageSquare className="h-8 w-8 text-teal-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {syncStatus.stats.conversations.toString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Messages
                  </CardTitle>
                  <BarChart className="h-8 w-8 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{`${syncStatus.stats.messagesProcessed} / ${syncStatus.stats.totalMessages}`}</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
      <Button
        type="submit"
        onClick={() => setIsImporterOpen(true)}
        disabled={syncStatus.status === "syncing"}
        className="flex w-full transform items-center gap-2 rounded-full bg-emerald-500 px-6 py-2 font-semibold text-success-foreground text-white transition-all duration-300 ease-in-out hover:bg-emerald-600 focus:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
      >
        <Upload className="h-5 w-5" />
        Start Sync
      </Button>
      <CSVImporter
        modalIsOpen={isImporterOpen}
        modalOnCloseTriggered={() => setIsImporterOpen(false)}
        onComplete={(data) => onImportedCSV(data)}
        style={
          {
            "--color-background": "hsl(var(--background))",
            "--color-primary": "hsl(var(--primary))",
            "--external-colors-secondary-500": "hsl(var(--primary))",
            "--external-colors-secondary-300": "hsl(var(--accent))",
            "--external-colors-primary-300": "hsl(var(--accent))",
          } as CSSProperties
        }
        darkMode
        template={{
          columns: Object.entries(IncomingMessageSchema.shape).map(
            ([name, field]) => ({
              name,
              key: name,
              required: !field.isOptional(),
              description: name,
            }),
          ),
        }}
      />
    </div>
  );
}
