import { expect } from "@playwright/test"
import { groupAdminFixture as test } from "../../fixtures"

test.describe("Admin Guides", () => {
   test("Guides card is visible on main admin page", async ({ groupPage }) => {
      const guidesPage = groupPage.getGuidesPage()
      
      // Ensure the guides card is visible
      await guidesPage.assertGuidesCardVisible()
      
      // Check that all guide content is present
      await guidesPage.assertGuideContentVisible()
      
      // Check that all CTA buttons are present
      await guidesPage.assertCTAButtonsVisible()
   })

   test("Guides card replaces Live Stream Feedback card", async ({ groupPage }) => {
      // Should have the new Guides card
      await expect(
         groupPage.page.getByTestId("card-title").filter({ hasText: "Guides" })
      ).toBeVisible()
      
      // Should NOT have the old Live Stream Feedback card
      await expect(
         groupPage.page.getByText("Live Stream Feedback")
      ).not.toBeVisible()
   })

   test("Guide CTA buttons are clickable", async ({ groupPage }) => {
      const guidesPage = groupPage.getGuidesPage()
      
      // Ensure the guides card is loaded
      await guidesPage.assertGuidesCardVisible()
      
      // Check that CTA buttons are clickable (we won't actually click them in this test
      // to avoid navigating away from the page, but we can verify they're interactive)
      const readGuideButton = groupPage.page.getByText("Read the full guide")
      const discoverButton = groupPage.page.getByText("Discover now")
      const talkToUsButton = groupPage.page.getByText("Talk to us")
      
      await expect(readGuideButton).toBeVisible()
      await expect(discoverButton).toBeVisible()
      await expect(talkToUsButton).toBeVisible()
      
      // Verify buttons are enabled (not disabled)
      await expect(readGuideButton).toBeEnabled()
      await expect(discoverButton).toBeEnabled()
      await expect(talkToUsButton).toBeEnabled()
   })

   test("Main admin page still loads correctly with new Guides card", async ({ groupPage }) => {
      // Ensure the main page loads
      await groupPage.assertGroupDashboardIsOpen()
      
      // Ensure we have multiple cards (analytics, guides, etc.)
      const cards = groupPage.page.getByTestId("card-custom")
      await expect(cards).toHaveCount(4) // Should have 4 cards total
      
      // Ensure the Guides card is one of them
      const guidesPage = groupPage.getGuidesPage()
      await guidesPage.assertGuidesCardVisible()
   })
})