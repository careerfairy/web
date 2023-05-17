import { Page } from "@playwright/test"
import { Group } from "@careerfairy/shared-lib/groups"
import { CommonPage } from "./CommonPage"

export class GroupDashboardPage extends CommonPage {
   constructor(public readonly page: Page, protected readonly group: Group) {
      super(page)
   }

   async open() {
      await this.page.goto(`/group/${this.group.id}/admin`)
   }

   public assertMainPageHeader() {
      return this.assertTextIsVisible("Main Page")
   }

   public topCreateLivestreamButton() {
      return this.page
         .getByRole("banner")
         .getByRole("button", { name: "Create New Live Stream" })
   }

   /**
    * Dismiss tooltips about new features
    */
   public async clickBackdropIfPresent() {
      const backdrop = this.page.locator(".MuiBackdrop-root")

      if (await backdrop.isVisible()) {
         await backdrop.click()
      }
   }

   public async goToCompanyPage() {
      await this.goToPage("Company")
   }

   public async goToMembersPage() {
      await this.goToPage("Team members")
   }

   private async goToPage(name: string) {
      await Promise.all([
         this.page.waitForNavigation(),
         this.page.getByRole("link", { name }).click(),
      ])
   }
}
