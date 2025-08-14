import { expect } from "@playwright/test"
import { groupAdminFixture as test } from "../../fixtures"
import { GroupDashboardPage } from "../../page-object-models/GroupDashboardPage"

test.describe("Admin Dashboard", () => {
   test.skip("Guides tile is visible on dashboard", async ({ groupPage }) => {
      // Verify we're on the dashboard
      await groupPage.assertGroupDashboardIsOpen()

      // Wait for the Guides card to be visible using the existing pattern
      await verifyGuidesCard(groupPage, "Guides")

      // Verify the first guide card is displayed (card 1 should be visible by default)
      await expect(groupPage.page.getByTestId("guide-card-1")).toBeVisible()

      // Verify the first guide's CTA button is visible
      await expect(groupPage.page.getByTestId("guide-cta-1")).toBeVisible()
   })

   test.skip("Guides carousel has navigation controls", async ({ groupPage }) => {
      await groupPage.assertGroupDashboardIsOpen()

      // Wait for Guides card to be loaded
      await verifyGuidesCard(groupPage, "Guides")

      // Verify navigation buttons are present
      await expect(groupPage.page.getByTestId("guides-prev-button")).toBeVisible()
      await expect(groupPage.page.getByTestId("guides-next-button")).toBeVisible()

      // Verify indicators are present (should have 3 indicators for 3 cards)
      await expect(groupPage.page.getByTestId("guides-indicators")).toBeVisible()
      await expect(groupPage.page.getByTestId("guides-indicator-0")).toBeVisible()
      await expect(groupPage.page.getByTestId("guides-indicator-1")).toBeVisible()
      await expect(groupPage.page.getByTestId("guides-indicator-2")).toBeVisible()
   })

   test.skip("Guides CTA buttons have correct text", async ({ groupPage }) => {
      await groupPage.assertGroupDashboardIsOpen()

      // Wait for Guides card
      await verifyGuidesCard(groupPage, "Guides")

      // Check first card CTA button text
      await expect(groupPage.page.getByTestId("guide-cta-1")).toHaveText("Read the full guide")

      // Navigate to second card and check its CTA
      await groupPage.page.getByTestId("guides-next-button").click()
      await expect(groupPage.page.getByTestId("guide-cta-2")).toBeVisible()
      await expect(groupPage.page.getByTestId("guide-cta-2")).toHaveText("Discover now")

      // Navigate to third card and check its CTA
      await groupPage.page.getByTestId("guides-next-button").click()
      await expect(groupPage.page.getByTestId("guide-cta-3")).toBeVisible()
      await expect(groupPage.page.getByTestId("guide-cta-3")).toHaveText("Talk to us")
   })
})

/**
 * Helper function to verify Guides card is visible, following the pattern from analytics tests
 */
async function verifyGuidesCard(
   groupPage: GroupDashboardPage,
   title: string
): Promise<void> {
   // Wait for card with title to be visible
   const guidesCard = groupPage.page.getByTestId("card-custom")
      .filter({ hasText: title })
   
   await expect(guidesCard).toBeVisible()
   
   // Verify the card title specifically
   const cardTitle = guidesCard.getByTestId("card-title")
   await expect(cardTitle).toHaveText(title)
}