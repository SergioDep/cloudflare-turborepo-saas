import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { db } from "@repo/db/client";
import { accountsTable } from "@repo/db/modules/auth/schema/accounts";
import { authenticatorsTable } from "@repo/db/modules/auth/schema/authenticators";
import { sessionsTable } from "@repo/db/modules/auth/schema/sessions";
import { usersTable } from "@repo/db/modules/auth/schema/users";
import { verificationTokensTable } from "@repo/db/modules/auth/schema/verification-tokens";

// TODO: Add Credentials, Discord, Github, and other providers
export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    accountsTable,
    sessionsTable,
    usersTable,
    authenticatorsTable,
    verificationTokensTable,
  }),
  providers: [Google],
});
