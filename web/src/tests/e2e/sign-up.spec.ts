import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Sign Up", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-up");
  });

  test("should render sign up page with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Sign Up | Mintly/);
    await expect(
      page.getByRole("heading", { name: "Create an account" }),
    ).toBeVisible();
  });

  test("should show validation errors when submitting empty form", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
    await expect(page.getByText("Please confirm your password")).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    const passwordInput = page.getByRole("textbox", {
      name: "Password",
      exact: true,
    });
    const toggleButton = page.getByRole("button", { name: "Show password" });

    await expect(passwordInput).toHaveAttribute("type", "password");

    await toggleButton.click();

    await expect(passwordInput).toHaveAttribute("type", "text");
    await expect(
      page.getByRole("button", { name: "Hide password" }),
    ).toBeVisible();
  });

  test("should show error when passwords do not match", async ({ page }) => {
    await page.getByLabel("Name").fill("John Doe");
    await page.getByLabel("Email").fill("john@example.com");
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill("Password123@");
    await page.getByLabel("Confirm password").fill("Different123@");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test("should navigate to sign in page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/auth");
  });

  test("should create account successfully and redirect to orgs", async ({
    page,
  }) => {
    await page.getByLabel("Name").fill(faker.person.fullName());
    await page.getByLabel("Email").fill(faker.internet.email());
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill("Password123!");
    await page.getByLabel("Confirm password").fill("Password123!");
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("/orgs", { timeout: 15000 });

    await expect(page).toHaveURL(/\/orgs/);
  });
});
