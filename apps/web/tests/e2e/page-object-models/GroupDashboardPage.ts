import { Locator, Page } from "@playwright/test"
import { expect } from "@playwright/test"
import { Group } from "@careerfairy/shared-lib/groups"
import { CommonPage } from "./CommonPage"
import { sleep } from "../utils"

export class GroupDashboardPage extends CommonPage {
   public inviteMemberButton: Locator
   public kickFromDashboard: Locator

   constructor(public readonly page: Page, protected readonly group: Group) {
      super(page)

      this.inviteMemberButton = this.page.getByRole("button", {
         name: "Invite a Member",
      })

      this.kickFromDashboard = this.page.getByRole("button", {
         name: "Kick from dashboard",
      })
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
      await sleep(1000)

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

   public async inviteGroupAdmin(email: string) {
      await this.inviteMemberButton.click()

      await this.page.getByLabel("Email *").fill(email)
      await this.page.getByRole("button", { name: "Send Invite" }).click()
   }

   public async assertGroupDashboardIsOpen() {
      await expect(this.topCreateLivestreamButton()).toBeVisible()
      await this.assertMainPageHeader()
   }

   private async goToPage(name: string) {
      await Promise.all([
         this.page.waitForNavigation(),
         this.page.getByRole("link", { name }).click(),
      ])
   }
}
