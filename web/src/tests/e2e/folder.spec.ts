import { faker } from "@faker-js/faker";
import { expect, type Page, test } from "@playwright/test";

const CHANNEL_URL = "/orgs/test-user/channels/019f1b80-42cf-79bb-b828-1cff43be9900";

test.beforeEach(async ({ page }) => {
  await page.goto(CHANNEL_URL);
});

// Nome único: o canal de seed é compartilhado entre os testes e as execuções.
function makeFolderTitle() {
  return `${faker.word.noun()}-${faker.string.alphanumeric(6)}`;
}

// As pastas ficam numa árvore dentro do popover "All Folders".
async function openFolderTree(page: Page) {
  const createFolderButton = page.getByRole("button", { name: "Create folder", exact: true });

  if (await createFolderButton.isVisible()) return;

  await page.getByRole("button", { name: "All Folders", exact: true }).click();
  await expect(createFolderButton).toBeVisible();
}

async function createFolder(page: Page, title: string) {
  await page.waitForLoadState("networkidle");
  await openFolderTree(page);
  await page.getByRole("button", { name: "Create folder", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Create Folder" });
  await dialog.getByLabel("Name").fill(title);
  await dialog.getByRole("button", { name: "Create Folder", exact: true }).click();

  await expect(page.getByText("Folder created successfully")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
}

async function openFolderActions(page: Page, title: string) {
  await openFolderTree(page);
  await page.getByRole("button", { name: `Actions for ${title}` }).click();
}

test.describe("Folder Management", () => {
  test("should create a folder successfully", async ({ page }) => {
    const folderTitle = makeFolderTitle();

    await createFolder(page, folderTitle);

    await openFolderTree(page);
    await expect(page.getByRole("treeitem", { name: folderTitle })).toBeVisible();
  });

  test("should navigate into a folder when clicking on it", async ({ page }) => {
    const folderTitle = makeFolderTitle();

    await createFolder(page, folderTitle);

    await openFolderTree(page);
    await page.getByRole("treeitem", { name: folderTitle }).click();

    await expect(page).toHaveURL((url) => {
      const params = url.searchParams;
      return (
        params.has("folder_id") &&
        params.has("folder_name") &&
        params.get("folder_name") === folderTitle
      );
    });
  });

  test("should rename a folder successfully", async ({ page }) => {
    const folderTitle = makeFolderTitle();

    await createFolder(page, folderTitle);

    await openFolderActions(page, folderTitle);
    await page.getByRole("button", { name: "Rename" }).click();

    const newTitle = makeFolderTitle();
    const renameDialog = page.getByRole("dialog", { name: "Rename Folder" });
    await renameDialog.getByRole("textbox").fill(newTitle);
    await renameDialog.getByRole("button", { name: "Update Folder" }).click();

    await expect(page.getByText("Folder updated successfully")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });

    await openFolderTree(page);
    await expect(page.getByRole("treeitem", { name: newTitle })).toBeVisible();
  });

  test("should delete a folder successfully", async ({ page }) => {
    const folderTitle = makeFolderTitle();

    await createFolder(page, folderTitle);

    await openFolderActions(page, folderTitle);
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    const deleteDialog = page.getByRole("dialog", { name: "Delete Folder" });
    await deleteDialog.getByRole("button", { name: "Delete Folder" }).click();

    await expect(page.getByText("Folder deleted successfully")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });

    await openFolderTree(page);
    await expect(page.getByRole("treeitem", { name: folderTitle })).toHaveCount(0);
  });
});
