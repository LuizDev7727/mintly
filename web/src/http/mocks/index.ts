import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { env } from "@/env";

const worker = setupWorker(...handlers);

export async function enableMSW() {
  if (env.VITE_NODE_ENV === "test") {
    await worker.start();
  }
}
