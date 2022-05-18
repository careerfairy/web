import { Page } from "@playwright/test"
import { CommonPage } from "./CommonPage"

export default class ProfilePage extends CommonPage {
   constructor(page: Page) {
      super(page)
   }

   open() {
      return this.page.goto(`/profile`)
   }

   openMyRecruiters() {
      return this.resilientGoto(`/profile/saved-recruiters`)
   }

   openCareerSkills() {
      return this.resilientGoto(`/profile/career-skills`)
   }

   clickBrowseAllEvents() {
      return Promise.all([
         this.page.waitForNavigation(),
         this.page.locator("text=Browse Events").click(),
      ])
   }
}
