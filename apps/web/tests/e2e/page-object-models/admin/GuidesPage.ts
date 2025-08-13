import { Locator } from "@playwright/test"
import { CommonPage } from "../CommonPage"
import { GroupDashboardPage } from "../GroupDashboardPage"

export class GuidesPage extends CommonPage {
   public guidesCard: Locator
   public guideCards: Locator
   public ctaButtons: Locator

   constructor(private readonly parent: GroupDashboardPage) {
      super(parent.page)
      
      this.guidesCard = this.page.getByTestId("card-custom").filter({
         has: this.page.getByTestId("card-title").filter({ hasText: "Guides" })
      })
      
      this.guideCards = this.guidesCard.locator('[data-testid*="guide-card"]')
      this.ctaButtons = this.guidesCard.locator('button')
   }

   public async assertGuidesCardVisible() {
      return this.guidesCard.waitFor({ state: "visible" })
   }

   public async assertGuideContentVisible() {
      // Check for the three guide titles
      await this.assertTextIsVisible("Host live streams that attract and engage top talent")
      await this.assertTextIsVisible("New Live stream management experience")
      await this.assertTextIsVisible("Promote your offline events")
   }

   public async assertCTAButtonsVisible() {
      await this.assertTextIsVisible("Read the full guide")
      await this.assertTextIsVisible("Discover now")
      await this.assertTextIsVisible("Talk to us")
   }

   public async clickCTAButton(buttonText: string) {
      await this.page.getByText(buttonText).click()
   }
}