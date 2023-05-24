import { CommonPage } from "../CommonPage"
import { GroupDashboardPage } from "../GroupDashboardPage"

export class LivestreamsAdminPage extends CommonPage {
   constructor(private readonly parent: GroupDashboardPage) {
      super(parent.page)
   }

   public async clickDraftsTab() {
      await this.page.getByRole("tab", { name: "Drafts" }).click()
   }

   public async clickUpcomingTab() {
      await this.page.getByRole("tab", { name: "Upcoming" }).click()
   }

   public async launchEditModal(nth: number = 0) {
      await this.page
         .getByRole("button", { name: "Manage stream" })
         .nth(nth)
         .click()
      await this.page
         .getByRole("button", { name: "Edit Draft Event" })
         .nth(nth)
         .click()
   }

   public async publish() {
      await this.parent.clickPublish()
   }
}
