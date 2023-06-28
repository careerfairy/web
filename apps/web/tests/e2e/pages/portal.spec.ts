import { expect } from "@playwright/test"
import UserSeed from "@careerfairy/seed-data/dist/users"
import LivestreamDialogPage from "../page-object-models/LivestreamDialogPage"
import { signedInFixture as test } from "../fixtures"
import { LoginPage } from "../page-object-models/LoginPage"
import { setupLivestreamData, setupUserSignUpData } from "../setupData"
import { SignupPage } from "../page-object-models/SignupPage"
import { PortalPage } from "../page-object-models/PortalPage"

test.describe("Welcome Dialog", () => {
   test("Welcome dialog should not appear when complete", async ({
      page,
      user,
   }) => {
      await UserSeed.updateUser(user.userEmail, {
         welcomeDialogComplete: true,
      })
      const portal = new PortalPage(page)

      // dialog should not be visible
      await expect(portal.skipVideoButton).not.toBeVisible()
   })

   test("Welcome dialog should appear for new accounts", async ({
      page,
      user,
   }) => {
      await UserSeed.updateUser(user.userEmail, {
         welcomeDialogComplete: false,
      })
      const portal = new PortalPage(page)

      // dialog should be visible
      await portal.assertWelcomeDialog()
   })

   test("Welcome dialog should appear after closing livestream dialog when creating an account", async ({
      page,
   }) => {
      await setupUserSignUpData()
      const email = UserSeed.getRandomEmail()
      const { livestream } = await setupLivestreamData()
      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await page.goto("/portal")

      // open dialog and try to register without login
      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.registrationButton.click()

      // redirection to login
      await page.waitForURL(`**/login?absolutePath**`)

      // click signup
      const login = new LoginPage(page)
      await login.clickSignupLinkLink()

      // signup
      const signup = new SignupPage(page)
      await signup.signupUser(email)

      // redirection to livestream should work
      await page.waitForURL(`**/portal/livestream/${livestream.id}`)
      await livestreamDialogPage.closeDialog()

      const portal = new PortalPage(page)

      // dialog should be visible
      await portal.assertWelcomeDialog()
   })
})
