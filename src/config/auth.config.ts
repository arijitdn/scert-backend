import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";

import { db } from "./db.config";
import { APP_URL, BETTER_AUTH_URL } from "../libs";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: BETTER_AUTH_URL,
  trustedOrigins: [APP_URL],
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        input: true,
        defaultValue: "SCHOOL",
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: 5,
    }),
  ],
});
