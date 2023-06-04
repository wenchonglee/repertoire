import { expect, test } from "@playwright/test";

test("has title 1", async ({ page }) => {
  test.fail();
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwrightdsfasd/);
});
