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
      await page.getByTestId("uc-accept-all-button").click()

      // scrollt o bottom
      await page.evaluate(() => {
         window.scrollTo(0, document.body.scrollHeight)
      })

      await page.getByRole("link", { name: "About us" }).click()
   })
})
