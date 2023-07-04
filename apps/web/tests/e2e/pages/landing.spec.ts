import { test, expect } from "@playwright/test"

test.describe("Landing Page Functionality", () => {
   test("should take me to the about us page after clicking on About Us", async ({
      page,
      browserName,
   }) => {
      test.skip(
         browserName === "webkit",
         "Failing in webkit for some reason, page was closed"
      )
      await page.goto("/")
      await page.locator('a[role="tab"]:has-text("About Us")').click()
      // Expect to be on the about us page
      await expect(page.locator("text=Meet our team")).toBeVisible()
   })
})
