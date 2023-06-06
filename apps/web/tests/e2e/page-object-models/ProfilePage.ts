import { Locator, Page } from "@playwright/test"
import { CommonPage } from "./CommonPage"

export default class ProfilePage extends CommonPage {
   readonly deleteAccountButton: Locator
   readonly deleteAccountConfirmationButton: Locator
   readonly deleteAccountConfirmationText: Locator

   constructor(page: Page) {
      super(page)

      this.deleteAccountButton = page.locator(
         "a[data-testid=delete-account-button]"
      )
      this.deleteAccountConfirmationButton = page.locator(
         "data-testid=delete-account-confirmation-button"
      )
      this.deleteAccountConfirmationText = page.locator(
         "input[id=deleteAccountConfirmationText]"
      )
   }

   open() {
      return this.page.goto(`/profile`)
   }

   openGroups() {
      return this.resilientGoto(`/profile/groups`)
   }

   openMyRecruiters() {
      return this.resilientGoto(`/profile/saved-recruiters`)
   }

   openCareerSkills() {
      return this.resilientGoto(`/profile/career-skills`)
   }

   async clickDeleteAccountButton() {
      return this.deleteAccountButton.click()
   }

   async clickDeleteAccountConfirmationButton() {
      return this.deleteAccountConfirmationButton.click()
   }

   async fillDeleteAccountConfirmationText(txt: string) {
      return this.deleteAccountConfirmationText.fill(txt)
   }

   clickBrowseAllEvents() {
      return Promise.all([
         this.page.waitForNavigation(),
         this.page.locator("text=Browse Events").click(),
      ])
   }
}
