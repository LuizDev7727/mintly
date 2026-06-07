import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";

export const authTest = betterAuth({
  plugins: [testUtils()],
});

const ctx = await authTest.$context;
export const test = ctx.test;
