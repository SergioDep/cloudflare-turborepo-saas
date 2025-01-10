"use server";

import { crmQueueWorker } from "@/modules/crm/server/api/queueWorker";

import { db } from "@repo/db/client";
import { eq } from "@repo/db/drizzle";
import { crmAccountsTable } from "@repo/db/modules/crm/schema/accounts";
import { AppError } from "@repo/validators/modules/base/app-error";

export async function createDataSyncAction({
  accountPhoneNumber,
}: {
  accountPhoneNumber: string;
}) {
  // Assert Account
  let account = await db.query.crmAccountsTable.findFirst({
    columns: {
      id: true,
      userId: true,
    },
    where: eq(crmAccountsTable.phoneNumber, accountPhoneNumber),
  });

  if (!account) {
    [account] = await db
      .insert(crmAccountsTable)
      .values({
        phoneNumber: accountPhoneNumber,
        accountName: accountPhoneNumber,
      })
      .returning({
        id: crmAccountsTable.id,
        userId: crmAccountsTable.userId,
      });
  }

  if (!account) {
    throw new AppError("base.validation.not-found", {
      details: {
        entity: "crm_account",
        context: {
          phoneNumber: accountPhoneNumber,
        },
      },
      message: "Account not found",
    });
  }

  let accountId = account.id;

  const data = await crmQueueWorker.createDataSyncTask({
    json: {
      accountId,
      userId: account.userId,
    },
  });

  return data;
}
