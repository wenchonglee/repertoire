import { expect, test } from "@playwright/test";

test.beforeAll(() => {
  console.log("!");
});
test("oh", () => {
  expect(5).toBe(5);
});

test.describe("Suite of tests", () => {
  test.beforeAll(() => {
    expect(0).toBe(0);
  });

  test("Test 1", async ({ page }) => {
    expect(1).toBe(1);
  });

  test("Test 2 with slow", async ({ page }) => {
    test.slow();
    expect(1).toBe(1);
  });

  test("Test 3 with @tag", async ({ page }) => {
    expect(1).toBe(1);
  });

  test.fixme("Test 4 with fixme", async ({ page }) => {
    expect(1).toBe(1);
  });

  test.skip("Test 5 with skip", async ({ page }) => {
    expect(1).toBe(1);
  });
});
