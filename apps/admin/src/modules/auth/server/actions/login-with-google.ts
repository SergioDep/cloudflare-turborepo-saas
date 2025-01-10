"use server";

import { isRedirectError } from "next/dist/client/components/redirect";
import { signIn } from "@/modules/auth/server/auth";

import { AppError } from "@repo/validators/modules/base/app-error";

export async function loginWithGoogleAction({
  redirectTo,
}: {
  redirectTo?: string;
}) {
  try {
    await signIn("google", {
      redirectTo: redirectTo,
    });
  } catch (error) {
    // see https://github.com/vercel/next.js/issues/55586#issuecomment-1869024539
    if (isRedirectError(error)) {
      throw error;
    }

    throw new AppError("base.auth.signin.google.unknown-error");
  }
}
