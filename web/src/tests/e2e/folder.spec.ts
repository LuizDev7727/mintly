import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const CHANNEL_URL =
  "/orgs/test-user/channels/019f1b80-42cf-79bb-b828-1cff43be9900";

test.beforeEach(async ({ page }) => {
  await page.goto(CHANNEL_URL);
});

test.describe("Folder Management", () => {
  test("should create a folder successfully", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "New Folder" }).click();

    const folderTitle = faker.word.noun();
    await page.getByLabel("Name").fill(folderTitle);
    await page.getByRole("button", { name: "Create Folder" }).click();

    await expect(page.getByText("Folder created successfully")).toBeVisible();
    await expect(page.getByText(folderTitle)).toBeVisible();
  });

  test("should navigate into a folder when clicking on it", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "New Folder" }).click();
    const folderTitle = faker.word.noun();
    await page.getByLabel("Name").fill(folderTitle);
    await page.getByRole("button", { name: "Create Folder" }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });

    await page.getByText(folderTitle).click();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/folder=/);
    await expect(page.getByText(folderTitle)).toBeVisible();
  });

  test("should rename a folder successfully", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "New Folder" }).click();
    const folderTitle = faker.word.noun();
    await page.getByLabel("Name").fill(folderTitle);
    await page.getByRole("button", { name: "Create Folder" }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });

    const folderCard = page
      .locator("div.rounded-lg")
      .filter({ hasText: folderTitle });
    await folderCard.getByRole("button").last().click();
    await page.getByRole("button", { name: "Rename" }).click();

    const newTitle = faker.word.noun();
    const renameDialog = page.getByRole("dialog", { name: "Rename Folder" });
    await renameDialog.getByRole("textbox").fill(newTitle);
    await renameDialog.getByRole("button", { name: "Update Folder" }).click();

    await expect(page.getByText("Folder updated successfully")).toBeVisible();
    await expect(page.getByText(newTitle)).toBeVisible();
  });

  test("should delete a folder successfully", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "New Folder" }).click();
    const folderTitle = faker.word.noun();
    await page.getByLabel("Name").fill(folderTitle);
    await page.getByRole("button", { name: "Create Folder" }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });

    const folderCard = page
      .locator("div.rounded-lg")
      .filter({ hasText: folderTitle });
    await folderCard.getByRole("button").last().click();
    await page.getByRole("button", { name: "Delete" }).click();

    const deleteDialog = page.getByRole("dialog", { name: "Delete Folder" });
    await deleteDialog.getByRole("button", { name: "Delete Folder" }).click();

    await expect(page.getByText("Folder deleted successfully")).toBeVisible();
    await expect(page.getByText(folderTitle)).not.toBeVisible();
  });
});
