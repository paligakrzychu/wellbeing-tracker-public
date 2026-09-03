import { expect, test } from "@playwright/test";

test("QA: Restore the selected Dark theme after reopening [WELLBEINGT-14]", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByTestId("theme-selector").waitFor();

  await page.getByTestId("theme-dark").click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  const stored = await page.evaluate(() =>
    localStorage.getItem("theme-preference"),
  );
  expect(stored).toBe("dark");

  await page.reload();

  await expect(page.locator("html")).toHaveClass(/dark/);

  const bgColor = await page.locator("body").evaluate((el) =>
    getComputedStyle(el).backgroundColor,
  );
  expect(bgColor).toBe("rgb(15, 23, 42)");
});
