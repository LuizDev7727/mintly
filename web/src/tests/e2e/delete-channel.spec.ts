import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";

test.describe("Delete Channel", () => {
  test("should delete a channel successfully", async ({ page }) => {
    await page.goto("/orgs/test-user/channels");

    await page.getByRole("button", { name: "Create new channel" }).click();

    const channelName = faker.company.name();
    await page.getByPlaceholder("Amazon").fill(channelName);
    await page.getByRole("button", { name: "Create Channel" }).click();

    await expect(page.getByText("Channel created successfully!")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });

    await page.getByRole("link", { name: channelName }).click();

    await page.waitForLoadState("networkidle");

    const channelPath = new URL(page.url()).pathname;
    await page.goto(`${channelPath}/settings`);

    await page.getByRole("button", { name: "Delete Channel" }).click();

    const deleteDialog = page.getByRole("dialog", { name: "Delete Channel" });
    await deleteDialog.getByRole("button", { name: "Delete Channel" }).click();

    await expect(page.getByText("Channel deleted successfully")).toBeVisible();
    await page.waitForURL("**/orgs/test-user");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/orgs/test-user");
    await expect(page.getByText(channelName)).not.toBeVisible();
  });
});
