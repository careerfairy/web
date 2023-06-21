import { Locator } from "@playwright/test"
import { CommonPage } from "../CommonPage"
import { GroupDashboardPage } from "../GroupDashboardPage"

export class ATSAdminPage extends CommonPage {
   public tableStatus: Locator

   constructor(private readonly parent: GroupDashboardPage) {
      super(parent.page)

      this.tableStatus = this.page.getByText(
         "First Synchronization In Progress"
      )
   }

   public async clickLinkAccountButton() {
      await this.page
         .getByRole("button", { name: "LINK ACCOUNT" })
         .first()
         .click()
   }

   public async selectATS() {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByRole("button", { name: "Greenhouse" })
         .click()
   }

   public async enterAPIKey(apiKey: string) {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByPlaceholder("Greenhouse API key")
         .fill(apiKey)
   }

   public async submitAPIKey() {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByRole("button", { name: "Submit" })
         .click()
   }

   public async clickContinueButton() {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByRole("button", { name: "Continue" })
         .click()
   }

   public async clickFinishButton() {
      await this.page
         .frameLocator("#merge-link-iframe")
         .getByText("Finish")
         .click()
   }

   public async checkJobsExist(
      jobs: { name: string; description: string }[]
   ): Promise<boolean> {
      for (const job of jobs) {
         const jobExists = await this.page
            .locator(
               `//td[text()='${job.name}']/following-sibling::td/div[text()='${job.description}']`
            )
            .first()
            .evaluate((element) => !!element)
         if (!jobExists) {
            return false
         }
      }
      return true
   }
}
