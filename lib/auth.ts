import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { isStrongPassword, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/password";
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./email";

const PASSWORD_VALIDATED_PATHS = new Set(["/sign-up/email", "/reset-password"]);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    sendResetPassword: async ({ user, url }) => {
      void sendResetPasswordEmail(user.email, url);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "user",
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail(user.email, url);
    },
    async afterEmailVerification(user) {
      void sendWelcomeEmail(user.email);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (!PASSWORD_VALIDATED_PATHS.has(ctx.path)) return;
      const password = (ctx.body as { password?: string; newPassword?: string })
        ?.password ?? (ctx.body as { newPassword?: string })?.newPassword;
      if (password && !isStrongPassword(password)) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must be at least 8 characters and include a letter and a number.",
          code: "WEAK_PASSWORD",
        });
      }
    }),
  },
});
