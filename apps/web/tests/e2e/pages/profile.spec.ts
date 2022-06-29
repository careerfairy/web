import { test, expect } from "@playwright/test"
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

test.beforeEach(async () => {
   await clearAuthData()
   await clearFirestoreData()
})

test.describe("My Recruiters", () => {
   test("Browse all events link should work", async ({ page }) => {
      const profilePage = new ProfilePage(page)

      await LoginPage.login(page)

      // open page
      await profilePage.openMyRecruiters()

      // browse all events should work
      await profilePage.clickBrowseAllEvents()

      expect(page.url()).toContain(`/next-livestreams`)
   })

   test("No Access to feature yet - missing badge", async ({ page }) => {
      const profilePage = new ProfilePage(page)

      const user: UserData = await LoginPage.login(page)

      // open page
      await profilePage.openMyRecruiters()

      // assertions
      await profilePage.text("You don't have access to this feature yet")
   })

   test("A Saved Recruiter is shown", async ({ page }) => {
      const profilePage = new ProfilePage(page)

      const user: UserData = await LoginPage.login(page, {
         badges: [UserPresenter.saveRecruitersRequiredBadge().key],
      })
      const recruiter = await UserSeed.addSavedRecruiter(user)

      // open page
      await profilePage.openMyRecruiters()

      // assertions
      await profilePage.text(
         `${recruiter.streamerDetails.firstName} ${recruiter.streamerDetails.lastName}`
      )
      await profilePage.text("To the event page")
   })

   test("Delete a saved recruiter", async ({ page }) => {
      const profilePage = new ProfilePage(page)

      const user: UserData = await LoginPage.login(page, {
         badges: [UserPresenter.saveRecruitersRequiredBadge().key],
      })
      const recruiter = await UserSeed.addSavedRecruiter(user)

      // open page
      await profilePage.openMyRecruiters()

      // confirm recruiter is present
      await profilePage.exactText(`${recruiter.streamerDetails.firstName}`)

      // Open settings menu
      await page.locator('[aria-label="settings"]').click()
      await page.locator("text=Delete").click()

      await sleep(2000)

      expect(
         await page.isVisible(`text=${recruiter.streamerDetails.firstName}`)
      ).toBeFalsy()
   })
})

test.describe("Career Skills", () => {
   test("Should have progression on a level", async ({ page }) => {
      const profilePage = new ProfilePage(page)

      await LoginPage.login(page, { badges: [EngageBadgeLevel3.key] })

      // open page
      await profilePage.openCareerSkills()

      const thereIsProgress = await page
         .locator(
            ".MuiStepConnector-root.MuiStepConnector-horizontal.Mui-completed .MuiStepConnector-line"
         )
         .isVisible()
      expect(thereIsProgress).toBeTruthy()
   })

   test("Should not have any progression", async ({ page }) => {
      const profilePage = new ProfilePage(page)

      await LoginPage.login(page)

      // open page
      await profilePage.openCareerSkills()

      const thereIsProgress = await page
         .locator(
            ".MuiStepConnector-root.MuiStepConnector-horizontal.Mui-completed .MuiStepConnector-line"
         )
         .isVisible()
      expect(thereIsProgress).toBeFalsy()
   })
})

test.describe("Personal Information", () => {
   test("it should be able to delete account", async ({ page }) => {
      const profilePage = new ProfilePage(page)

      await LoginPage.login(page)

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
         page.waitForNavigation(),
      ])

      // expect being on the login page
      const thereIsLoginButton = await page
         .locator("data-testid=login-button")
         .isVisible()
      expect(thereIsLoginButton).toBeTruthy()
   })

   test("it should not be able to delete account since the confirmation text is not correct", async ({
      page,
   }) => {
      const profilePage = new ProfilePage(page)

      await LoginPage.login(page)

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
      const thereIsLoginButton = await page
         .locator("data-testid=login-button")
         .isVisible()
      expect(thereIsLoginButton).toBeFalsy()
   })
})
