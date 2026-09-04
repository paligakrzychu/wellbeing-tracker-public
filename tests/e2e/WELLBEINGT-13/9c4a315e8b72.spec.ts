import { expect, test } from "@playwright/test";

test("QA: Apply the Dark theme [WELLBEINGT-13]", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("theme-selector").waitFor();

  await page.getByTestId("theme-dark").click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  const bgColor = await page.locator("body").evaluate((el) =>
    getComputedStyle(el).backgroundColor,
  );
  expect(bgColor).toBe("rgb(15, 23, 42)");

  const textColor = await page.locator("body").evaluate((el) =>
    getComputedStyle(el).color,
  );
  expect(textColor).toBe("rgb(248, 250, 252)");
});
