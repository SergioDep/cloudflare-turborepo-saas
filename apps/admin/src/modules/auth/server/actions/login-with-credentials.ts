"use server";

import { isRedirectError } from "next/dist/client/components/redirect";
import { z } from "zod";

import { SignInCredentialsSchema } from "@repo/validators/modules/auth/credentials";
import { AppError } from "@repo/validators/modules/base/app-error";

export async function loginWithCredentialsAction({
  credentials,
}: {
  credentials?: z.infer<typeof SignInCredentialsSchema>;
}) {
  try {
    throw new AppError("base.general.not-implemented");
  } catch (error) {
    // see https://github.com/vercel/next.js/issues/55586#issuecomment-1869024539
    if (isRedirectError(error)) {
      throw error;
    }

    throw new AppError("base.auth.signin.google.unknown-error");
  }
}
