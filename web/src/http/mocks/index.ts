import { setupWorker } from "msw/browser";
import { env } from "@/env";
import { handlers } from "./handlers";

const worker = setupWorker(...handlers);

export async function enableMSW() {
  if (env.VITE_NODE_ENV === "test") {
    await worker.start();
  }
}
