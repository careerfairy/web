import { expect } from "@playwright/test"
import UserSeed from "@careerfairy/seed-data/dist/users"
import LivestreamSeed from "@careerfairy/seed-data/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import LivestreamDialogPage from "../page-object-models/LivestreamDialogPage"
import { signedInFixture as test } from "../fixtures"
import { setupLivestreamData } from "../setupData"
import { MAX_DAYS_TO_SHOW_RECORDING } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import { credentials, pdfSamplePath } from "../../constants"
import { LoginPage } from "../page-object-models/LoginPage"
import { PortalPage } from "../page-object-models/PortalPage"
import { CreditsDialogModel } from "../page-object-models/CreditsDialogModel"
import { sleep } from "../utils"

test.describe("Win credits by completing actions", () => {
   test("Upload CV and win a credit", async ({ page, user }) => {
      await setupData({ user, userDataOverrides: { credits: 0 } })
      const dialogPage = new CreditsDialogModel(page)

      await dialogPage.openGetMoreCreditsDialog()

      // CV upload not complete yet
      await expect(page.getByText("Upload your CV+ 1")).toBeVisible()

      await page.pause()
      // Enter CV upload and upload a file
      await dialogPage.enterCVUpload()
      await dialogPage.clickAndUploadFiles(page.locator("label"), pdfSamplePath)

      // upload success
      await expect(page.getByText("CV uploaded!")).toBeVisible()

      // congrats should be displayed
      await dialogPage.backButton.click()
      await expect(dialogPage.uploadCVItem.getByText("Congrats")).toBeVisible()

      // credits should be updated
      await assertUserCredits(user, 1)
   })
})

type SetupDataOptions = {
   user: UserData
   userDataOverrides?: Partial<UserData>
}

async function setupData(opts: SetupDataOptions) {
   if (opts.userDataOverrides) {
      await UserSeed.updateUser(opts.user.userEmail, opts.userDataOverrides)
   }
}

/**
 * Asserts that the user's credits are updated
 *
 * Since it's a cloud function in the background that updates the user
 * credits, we need to wait for it to be updated
 */
async function assertUserCredits(user, credits) {
   let userData: UserData

   // try multiple times until the credits are updated
   let tries = 5
   while (tries-- > 0) {
      userData = await UserSeed.getUserData(user.userEmail)
      if (userData?.credits > 0) {
         break // update should be complete
      } else {
         // keep trying, wait a bit
         await sleep(500)
         continue
      }
   }

   expect(userData.credits).toEqual(credits)
}
