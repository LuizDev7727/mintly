import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Onboarding", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("should walk a new user through skip invite, create channel and the integration step", async ({
    page,
  }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Name").fill(faker.person.fullName());
    await page.getByLabel("Email").fill(faker.internet.email());
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill("Password123!");
    await page.getByLabel("Confirm password").fill("Password123!");
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL(/\/sign-up\/onboarding/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "Invite your team" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Skip for now" }).click();

    await expect(
      page.getByRole("heading", { name: "Create your channel" }),
    ).toBeVisible();

    await page.getByLabel("Channel name").fill(faker.word.noun());
    await page.getByLabel("Description").fill(faker.lorem.sentence());
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: "Connect an integration" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Connect" })).toBeVisible();
    await expect(page.getByText("Coming soon")).toHaveCount(2);
    await expect(
      page.getByRole("button", { name: "Finish setup" }),
    ).toBeDisabled();
  });

  test("should block the app until the onboarding is finished", async ({
    page,
  }) => {
    await page.goto("/sign-up");
    await page.getByLabel("Name").fill(faker.person.fullName());
    await page.getByLabel("Email").fill(faker.internet.email());
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill("Password123!");
    await page.getByLabel("Confirm password").fill("Password123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL(/\/sign-up\/onboarding/, { timeout: 15000 });

    await page.goto("/orgs");

    await expect(page).toHaveURL(/\/sign-up\/onboarding/);
  });
});
