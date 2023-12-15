import { test as base, expect } from "@playwright/test"
import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/dist/emulators"
import { LoginPage } from "../page-object-models/LoginPage"
import ProfilePage from "../page-object-models/ProfilePage"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import UserSeed from "@careerfairy/seed-data/dist/users"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { sleep } from "../utils"
import { EngageBadgeLevel3 } from "@careerfairy/shared-lib/dist/badges/EngageBadges"
import { credentials } from "../../constants"

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
   profilePage: async ({ page, user }, use) => {
      // user is a dependency, its required here even if not used
      const profilePage = new ProfilePage(page)

      await use(profilePage)
   },
})

test.describe("My Recruiters", () => {
   test("Browse all events link should work", async ({ profilePage }) => {
      // open page
      await profilePage.openMyRecruiters()

      // browse all events should work
      await profilePage.clickBrowseAllEvents()

      expect(profilePage.page.url()).toContain(`/next-livestreams`)
   })

   test("No Access to feature yet - missing badge", async ({ profilePage }) => {
      // open page
      await profilePage.openMyRecruiters()

      // assertions
      await expect(
         profilePage.page.getByRole("heading", {
            name: "You need to unlock the Networker Level 2 badge to access this feature.",
         })
      ).toBeVisible()
   })

   test("A Saved Recruiter is shown", async ({ user, profilePage }) => {
      await UserSeed.updateUser(user.userEmail, {
         badges: [UserPresenter.saveRecruitersRequiredBadge().key],
      })

      const recruiter = await UserSeed.addSavedRecruiter(user)

      // open page
      await profilePage.openMyRecruiters()

      // assertions
      await expect(
         profilePage.text(
            `${recruiter.streamerDetails.firstName} ${recruiter.streamerDetails.lastName}`
         )
      ).toBeVisible()

      await expect(profilePage.text("To the event page")).toBeVisible()
   })

   test("Delete a saved recruiter", async ({ profilePage, user }) => {
      await UserSeed.updateUser(user.userEmail, {
         badges: [UserPresenter.saveRecruitersRequiredBadge().key],
      })
      const recruiter = await UserSeed.addSavedRecruiter(user)

      // open page
      await profilePage.openMyRecruiters()

      // confirm recruiter is present
      await expect(
         profilePage.page.getByText(recruiter.streamerDetails.firstName)
      ).toBeVisible()

      // Open settings menu
      await profilePage.page.locator('[aria-label="settings"]').click()
      await profilePage.page.locator("text=Delete").click()

      await sleep(2000)

      expect(
         await profilePage.page.isVisible(
            `text=${recruiter.streamerDetails.firstName}`
         )
      ).toBeFalsy()
   })
})

test.describe("Career Skills", () => {
   test("Should have progression on a level", async ({ profilePage, user }) => {
      await UserSeed.updateUser(user.userEmail, {
         badges: [EngageBadgeLevel3.key],
      })

      // open page
      await profilePage.openCareerSkills()

      const thereIsProgress = await profilePage.page
         .locator(
            ".MuiStepConnector-root.MuiStepConnector-horizontal.Mui-completed .MuiStepConnector-line"
         )
         .isVisible()
      expect(thereIsProgress).toBeTruthy()
   })

   test("Should not have any progression", async ({ profilePage }) => {
      // open page
      await profilePage.openCareerSkills()

      const thereIsProgress = await profilePage.page
         .locator(
            ".MuiStepConnector-root.MuiStepConnector-horizontal.Mui-completed .MuiStepConnector-line"
         )
         .isVisible()
      expect(thereIsProgress).toBeFalsy()
   })
})

test.describe("Personal Information", () => {
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
