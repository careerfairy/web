import { expect } from "@playwright/test"
import UserSeed from "@careerfairy/seed-data/dist/users"
import LivestreamSeed from "@careerfairy/seed-data/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import LivestreamDialogPage from "../page-object-models/LivestreamDialogPage"
import { signedInFixture as test } from "../fixtures"
import { setupLivestreamData } from "../setupData"
import { pdfSamplePath } from "../../constants"
import { CreditsDialogModel } from "../page-object-models/CreditsDialogModel"
import { sleep } from "../utils"
import { LivestreamEvent } from "@careerfairy/shared-lib/src/livestreams"
import { REWARD_LIVESTREAM_ATTENDANCE_SECONDS } from "@careerfairy/shared-lib/dist/rewards"

test.describe("Win credits by completing actions", () => {
   test("Upload CV and win a credit", async ({ page, user }) => {
      await setupData({ user, userDataOverrides: { credits: 0 } })
      const dialogPage = new CreditsDialogModel(page)

      await dialogPage.openGetMoreCreditsDialog()

      // CV upload not complete yet
      await expect(page.getByText("Upload your CV+ 1")).toBeVisible()

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

   test("Attend first livestream and win a credit", async ({ page, user }) => {
      const { livestream } = await setupData({
         user,
         userDataOverrides: { credits: 0 },
         livestream: true,
      })

      const dialogPage = new CreditsDialogModel(page)
      await dialogPage.openGetMoreCreditsDialog()

      // first livestream attendance not complete yet
      expect(await dialogPage.attendFirstLivestreamItem.textContent()).toEqual(
         "Attend first live stream+ 1"
      )

      // mock the livestream attendance started time to not wait 5min
      const futureStartMs = REWARD_LIVESTREAM_ATTENDANCE_SECONDS * 1000
      await page.evaluate((time) => {
         sessionStorage.setItem("livestreamAttendanceStarted", time + "")
      }, futureStartMs)

      // enter the current live livestream
      await dialogPage.enterFirstAttendance()
      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)
      await livestreamDialogPage.openDialog(false)
      await page.waitForURL(`**/streaming/${livestream.id}/viewer`)

      // wait for the congrats message
      await expect(
         page.getByRole("heading", { name: "Congratulations!" })
      ).toBeVisible({ timeout: 25000 })

      await assertUserCredits(user, 1)
   })
})

type SetupDataOptions = {
   user: UserData
   userDataOverrides?: Partial<UserData>

   livestream?: boolean
}

type SetupDataResult = {
   livestream?: LivestreamEvent
}

async function setupData(opts: SetupDataOptions): Promise<SetupDataResult> {
   const result: SetupDataResult = {}

   if (opts.userDataOverrides) {
      await UserSeed.updateUser(opts.user.userEmail, opts.userDataOverrides)
   }

   if (opts.livestream) {
      // create a livestream and make the user registered
      const { livestream } = await setupLivestreamData(
         undefined,
         {
            groupQuestionsMap: null,
         },
         "createLive"
      )

      await LivestreamSeed.userData({
         user: opts.user,
         livestream,
         registered: true,
      })

      result.livestream = livestream
   }

   return result
}

/**
 * Asserts that the user's credits are updated
 *
 * Since it's a cloud function in the background that updates the user
 * credits, we need to wait for it to be updated
 */
async function assertUserCredits(user: UserData, credits: number) {
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
