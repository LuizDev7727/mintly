import Replicate from "replicate";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

export const replicate = new Replicate({
  auth: await getInfisicalSecret({ secretName: "REPLICATE_API_TOKEN" }),
});
