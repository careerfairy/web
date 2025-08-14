import { expect } from "@playwright/test"
import { groupAdminFixture as test } from "../../fixtures"

test.describe("Admin Dashboard", () => {
   test("Guides tile is visible on dashboard", async ({ groupPage }) => {
      // Verify we're on the dashboard
      await groupPage.assertGroupDashboardIsOpen()

      // Check that the Guides card is visible
      await expect(
         groupPage.page.getByTestId("card-title").filter({ hasText: "Guides" })
      ).toBeVisible()

      // Check that the carousel navigation is present
      await expect(groupPage.page.locator("button").first()).toBeVisible()

      // Verify the first guide card content is visible
      await expect(
         groupPage.page.getByText("Host live streams that attract and engage top talent")
      ).toBeVisible()
   })

   test("Guides carousel navigation works", async ({ groupPage }) => {
      await groupPage.assertGroupDashboardIsOpen()

      // Find the next button and click it
      const nextButton = groupPage.page.locator("button").filter({ hasText: "" }).last()
      await nextButton.click()

      // Verify second card content is visible
      await expect(
         groupPage.page.getByText("New Live stream management experience")
      ).toBeVisible()

      // Click next again
      await nextButton.click()

      // Verify third card content is visible
      await expect(
         groupPage.page.getByText("Promote your offline events")
      ).toBeVisible()
   })

   test("Guides CTA buttons work", async ({ groupPage, page }) => {
      await groupPage.assertGroupDashboardIsOpen()

      // Test external link (first card)
      const readGuideButton = page.getByRole("button", { name: "Read the full guide" })
      await expect(readGuideButton).toBeVisible()

      // Test internal navigation (second card) 
      const nextButton = groupPage.page.locator("button").filter({ hasText: "" }).last()
      await nextButton.click()

      const discoverButton = page.getByRole("button", { name: "Discover now" })
      await expect(discoverButton).toBeVisible()

      // Test third CTA
      await nextButton.click()
      const talkToUsButton = page.getByRole("button", { name: "Talk to us" })
      await expect(talkToUsButton).toBeVisible()
   })
})