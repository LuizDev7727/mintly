import { test, expect } from "@playwright/test";

test.describe("Sign In", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  const registeredUser = {
    email: "testuser@gmail.com",
    password: "DwayneJ781@",
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("should render sign in page with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Sign In | Mintly/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("should show validation errors when submitting empty form", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
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

  test("should navigate to sign up page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign up" }).click();

    await expect(page).toHaveURL("/auth/sign-up");
  });

  test("should sign in successfully and redirect to orgs", async ({ page }) => {
    await page.getByLabel("Email").fill(registeredUser.email);
    await page
      .getByRole("textbox", { name: "Password", exact: true })
      .fill(registeredUser.password);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL("/orgs");
  });
});
