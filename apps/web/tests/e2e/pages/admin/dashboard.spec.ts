import { expect } from "@playwright/test"
import { groupAdminFixture as test } from "../../fixtures"

test.describe("Dashboard Main Page", () => {
   test("Guides card is visible and functional", async ({ groupPage }) => {
      // Navigate to the main dashboard page
      await groupPage.goto(`/group/${groupPage.group.id}/admin`)

      // Verify the Guides card is visible
      await groupPage.assertGuidesCardVisible()

      // Test carousel navigation
      await groupPage.navigateGuidesCarousel()

      // Verify the card contains expected content
      const guidesCard = groupPage.page.getByTestId("card-custom").filter({
         has: groupPage.page.getByTestId("card-title").filter({
            hasText: "Guides"
         })
      })

      // Check that CTA buttons are present
      await expect(guidesCard.getByRole("button")).toHaveCount(5) // 3 indicators + 2 nav buttons

      // Verify carousel indicators are present
      const indicators = guidesCard.locator('[role="generic"]').filter({
         hasText: ""
      })
      await expect(indicators).toHaveCount(3)
   })

   test("Dashboard displays all expected cards", async ({ groupPage }) => {
      // Navigate to the main dashboard page
      await groupPage.goto(`/group/${groupPage.group.id}/admin`)

      // Verify all main dashboard cards are present
      const expectedCards = [
         "Next live stream",
         "Guides",
         "Talent reached", 
         "Registration sources"
      ]

      for (const cardTitle of expectedCards) {
         await groupPage.waitForAnalyticsCardVisible({
            fields: {
               title: cardTitle,
            },
         })
      }
   })
})