"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const COOKIE_NAME = "cookie_mintly_consent";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function acceptCookies() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "accepted", {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

export async function rejectCookies() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "rejected", {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
