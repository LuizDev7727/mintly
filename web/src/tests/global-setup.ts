import { chromium, type FullConfig } from "@playwright/test";
import path from "path";

export const AUTH_FILE = path.join(import.meta.dirname, ".auth/user.json");

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL!;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/auth`);
  await page.getByLabel("Email").fill("testuser@gmail.com");
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("DwayneJ781@");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/orgs**");

  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();
}
