import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Update Channel Name", () => {
  test("should update the channel name successfully", async ({ page }) => {
    await page.goto("/orgs/test-user");

    await page.getByRole("button", { name: "Create new channel" }).click();

    const channelName = faker.company.name();
    await page.getByPlaceholder("Amazon").fill(channelName);
    await page.getByRole("button", { name: "Create Channel" }).click();

    await expect(
      page.getByText("Channel created successfully!"),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });

    const channelCard = page
      .locator("div.rounded-md")
      .filter({ hasText: channelName });
    await channelCard.getByRole("link", { name: "See channel" }).click();

    await page.waitForLoadState("networkidle");

    const channelPath = new URL(page.url()).pathname;
    await page.goto(`${channelPath}/settings`);

    const newChannelName = faker.company.name();
    const nameInput = page.getByPlaceholder("Channel name");
    await nameInput.fill(newChannelName);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByText("Channel updated successfully"),
    ).toBeVisible();
    await expect(nameInput).toHaveValue(newChannelName);
  });
});
