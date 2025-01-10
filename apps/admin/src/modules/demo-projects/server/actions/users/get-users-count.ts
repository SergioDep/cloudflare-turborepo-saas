"use server";

import { db } from "@repo/db/client";
import { usersTable } from "@repo/db/modules/auth/schema/users";

export async function getUsersCountAction() {
  return await db.$count(usersTable);
}
