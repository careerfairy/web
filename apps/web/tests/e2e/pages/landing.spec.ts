import { test, expect, Page } from "@playwright/test"

test.describe("Landing Page Functionality", () => {
   test("should take me to the about us page after clicking on About Us", async ({
      page,
   }) => {
      await page.goto("/")
      await page.locator('a[role="tab"]:has-text("About Us")').click()
      // Expect to be on the about us page
      await expect(page.locator("text=Meet2 our team")).toBeVisible()
   })
})
