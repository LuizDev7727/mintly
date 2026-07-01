import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Create Channel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/orgs/test-user");
  });

  test("should open create channel dialog when clicking the button", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Create new channel" }).click();

    await expect(
      page.getByText("Create a new channel in your organization."),
    ).toBeVisible();
  });

  test("should create a channel successfully", async ({ page }) => {
    await page.getByRole("button", { name: "Create new channel" }).click();

    const channelName = faker.company.name();
    await page.getByPlaceholder("Amazon").fill(channelName);
    await page.getByRole("button", { name: "Create Channel" }).click();

    await expect(page.getByText("Channel created successfully!")).toBeVisible();
  });
});
