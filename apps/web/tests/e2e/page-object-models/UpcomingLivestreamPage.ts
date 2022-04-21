import { Page } from "@playwright/test"
import CommonPage from "./CommonPage"
import { Group } from "@careerfairy/shared-lib/dist/groups"

export default class UpcomingLivestreamPage extends CommonPage {
   constructor(page: Page) {
      super(page)
   }

   open(livestreamId: string) {
      return this.page.goto(`/upcoming-livestream/${livestreamId}`)
   }

   attend() {
      return this.exactText("I'll attend").click()
   }

   async selectRandomCategoriesFromGroup(group: Group) {
      for (let category of group.categories) {
         await this.page
            .locator(`text=New!​${category.name} >> div[role="button"]`)
            .click()

         const randomOption =
            category.options[
               Math.floor(Math.random() * category.options.length)
            ]

         await this.page.locator(`[data-value="${randomOption.id}"]`).click()
      }
   }

   submitCategories() {
      return this.page
         .locator('div[role="dialog"] >> text=I\'ll attend')
         .click()
   }

   skip() {
      return this.page.locator("text=Skip").click()
   }

   finish() {
      return this.page.locator("text=See all our events").click()
   }
}
