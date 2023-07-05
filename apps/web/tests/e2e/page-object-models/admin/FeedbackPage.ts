import { Locator } from "@playwright/test"
import { CommonPage } from "../CommonPage"
import { GroupDashboardPage } from "../GroupDashboardPage"

export class FeedbackPage extends CommonPage {
   public talentPoolTable: Locator

   constructor(private readonly parent: GroupDashboardPage) {
      super(parent.page)
   }

   public async openFeedbackCard(livestreamTitle: string) {
      await this.page
         .getByRole("link", {
            name: livestreamTitle,
         })
         .click()
   }
}
