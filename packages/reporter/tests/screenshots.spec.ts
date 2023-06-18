import { expect, test } from "@playwright/test";

test("screenshots", async ({ page }) => {
  await page.goto("https://playwright.dev/");
  await page.screenshot({ path: "picture1.png" });

  await page.goto("https://google.com/");
  await page.screenshot({ path: "picture2.png" });
  await expect(page).toHaveScreenshot("image.png");
});
