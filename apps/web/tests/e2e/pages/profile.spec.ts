import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/dist/emulators"
import UserSeed from "@careerfairy/seed-data/dist/users"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { test as base, expect } from "@playwright/test"
import { credentials } from "../../constants"
import { LoginPage } from "../page-object-models/LoginPage"
import ProfilePage from "../page-object-models/ProfilePage"

const test = base.extend<{
   user: UserData
   profilePage: ProfilePage
}>({
   user: async ({ page }, use) => {
      await clearAuthData()
      await clearFirestoreData()

      const userData = await UserSeed.createUser(credentials.correctEmail)

      await LoginPage.login(page)

      await use(userData)
   },
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   profilePage: async ({ page, user }, use) => {
      // user is a dependency, its required here even if not used
      const profilePage = new ProfilePage(page)

      await use(profilePage)
   },
})

test.skip("Personal Information", () => {
   test("it should be able to delete account", async ({
      profilePage,
      browserName,
   }) => {
      test.skip(browserName === "chromium", "very flakey on chromium")

      // open page
      await profilePage.open()

      // scroll to delete button
      await profilePage.deleteAccountButton.scrollIntoViewIfNeeded()

      // click on delete account button
      await profilePage.clickDeleteAccountButton()

      await profilePage.fillDeleteAccountConfirmationText("delete")

      // click on delete account confirmation button
      await Promise.all([
         profilePage.clickDeleteAccountConfirmationButton(),
         profilePage.page.waitForURL(`**/login?absolutePath**`),
      ])

      // wait for the login button to be visible
      await profilePage.page.waitForSelector("data-testid=login-button")

      // expect being on the login page
      const thereIsLoginButton = await profilePage.page
         .locator("data-testid=login-button")
         .isVisible()
      expect(thereIsLoginButton).toBeTruthy()
   })

   test("it should not be able to delete account since the confirmation text is not correct", async ({
      profilePage,
   }) => {
      // open page
      await profilePage.open()

      // scroll to delete button
      await profilePage.deleteAccountButton.scrollIntoViewIfNeeded()

      // click on delete account button
      await profilePage.clickDeleteAccountButton()

      await profilePage.fillDeleteAccountConfirmationText("incorrect text")

      // expect confirmation button to be disabled
      const isButtonDisable =
         await profilePage.deleteAccountConfirmationButton.isDisabled()
      expect(isButtonDisable).toBeTruthy()

      // expect not being on the login page
      const thereIsLoginButton = await profilePage.page
         .locator("data-testid=login-button")
         .isVisible()
      expect(thereIsLoginButton).toBeFalsy()
   })
})
