"use server";

import { isRedirectError } from "next/dist/client/components/redirect";
import { signOut } from "@/modules/auth/server/auth";

import { AppError } from "@repo/validators/modules/base/app-error";

export async function logoutAction({ redirectTo }: { redirectTo?: string }) {
  try {
    await signOut({
      redirectTo: redirectTo,
    });
  } catch (error) {
    // see https://github.com/vercel/next.js/issues/55586#issuecomment-1869024539
    if (isRedirectError(error)) {
      throw error;
    }

    throw new AppError("base.auth.signout.unknown-error");
  }
}
