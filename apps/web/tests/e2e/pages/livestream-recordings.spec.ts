import { expect } from "@playwright/test"
import UserSeed from "@careerfairy/seed-data/dist/users"
import LivestreamSeed from "@careerfairy/seed-data/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import LivestreamDialogPage from "../page-object-models/LivestreamDialogPage"
import { signedInFixture as test } from "../fixtures"
import { setupLivestreamData } from "../setupData"
import { MAX_DAYS_TO_SHOW_RECORDING } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import { credentials } from "../../constants"
import { LoginPage } from "../page-object-models/LoginPage"

// outside access window =(means) livestream is older than the max days to show recording

test.describe("Access a recording when the user registered to the livestream", () => {
   test("Not enough credits to buy a recording when the livestream is outside access window", async ({
      page,
      user,
   }) => {
      const { livestream } = await setupData({
         user,
         userDataOverrides: { credits: 0 },
      })

      await page.goto("/past-livestreams")

      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()
      await expect(livestreamDialogPage.notEnoughCreditsButton).toBeVisible()
   })

   test("Buy a recording with credits when registered and the livestream is outside access", async ({
      page,
      user,
   }) => {
      const initialCredits = 1
      const { livestream } = await setupData({
         user,
         userDataOverrides: { credits: initialCredits },
      })

      await page.goto("/past-livestreams")

      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()

      // we have 1 credit
      await expect(page.getByText("You currently have 1 left")).toBeVisible()

      // click buy
      await livestreamDialogPage.buyRecordingButton.click()
      await livestreamDialogPage.assertRecordingVideoIsVisible()

      // confirm user credits decreased
      const userUpdated = await UserSeed.getUserData(user.userEmail)
      expect(userUpdated.credits).toEqual(initialCredits - 1)
   })

   for (const participated of [true, false]) {
      // confirm user has access to the recording participating or not
      test(
         "No need to buy the recording because the livestream is inside the access window, user participated: " +
            participated,
         async ({ page, user }) => {
            const { livestream } = await setupData({
               user,
               livestreamDateInsideMaxDaysToShowRecording: true,
               participated,
            })

            await page.goto("/past-livestreams")

            const livestreamDialogPage = new LivestreamDialogPage(
               page,
               livestream
            )
            await livestreamDialogPage.openDialog()

            await livestreamDialogPage.assertRecordingVideoIsVisible(true)
         }
      )
   }

   test("Access the recording when signed out - inside access window", async ({
      page,
   }) => {
      const user = await UserSeed.createUser(credentials.unregisteredEmail)

      const { livestream } = await setupData({
         user,
         livestreamDateInsideMaxDaysToShowRecording: true,
      })

      await page.goto("/past-livestreams")

      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.signUpToWatchButton.click()

      // sign up page -> log in page
      await page.getByRole("link", { name: "Log in" }).click()

      // ensure we are on the login page, before filling out the form
      // or else it will start filling out the form on the sign up page
      // causing the test to fail
      await page.waitForURL((url) => url.pathname === "/login")

      await LoginPage.login(page, {
         openPage: false,
         email: user.userEmail,
         waitForURL: `**/past-livestreams/livestream/${livestream.id}`,
      })

      await livestreamDialogPage.assertRecordingVideoIsVisible(true)
   })
})

test.describe("Access a recording when the user did not register to the livestream", () => {
   // user needs to buy the recording for any livestream date
   for (const insideAccessWindow of [true, false]) {
      test(`Recording ${
         insideAccessWindow ? "inside" : "outside"
      } the access window needs to be bought`, async ({ page, user }) => {
         const { livestream } = await setupData({
            user,
            registered: false,
            userDataOverrides: { credits: 1 },
         })

         await page.goto("/past-livestreams")
         const livestreamDialogPage = new LivestreamDialogPage(page, livestream)
         await livestreamDialogPage.openDialog()

         // click buy
         await livestreamDialogPage.buyRecordingButton.click()
         await livestreamDialogPage.assertRecordingVideoIsVisible()
      })
   }
})

type SetupDataOptions = {
   user: UserData
   userDataOverrides?: Partial<UserData>
   livestreamDateInsideMaxDaysToShowRecording?: boolean
   participated?: boolean
   registered?: boolean
}

/**
 * Creates a past livestream and makes the user registered
 */
async function setupData(opts: SetupDataOptions) {
   if (opts.userDataOverrides) {
      await UserSeed.updateUser(opts.user.userEmail, opts.userDataOverrides)
   }

   const numDaysToSubtract = opts.livestreamDateInsideMaxDaysToShowRecording
      ? MAX_DAYS_TO_SHOW_RECORDING - 1 // inside recording access
      : MAX_DAYS_TO_SHOW_RECORDING + 1 // outside recording access

   // past livestream date
   const pastDate = new Date()
   pastDate.setDate(pastDate.getDate() - numDaysToSubtract)

   const { livestream } = await setupLivestreamData(undefined, {
      overrideLivestreamDetails: {
         // @ts-ignore seed data accepts a date object
         start: pastDate,
         groupQuestionsMap: null,
      },
   })

   await Promise.all([
      // add recording info to livestream
      LivestreamSeed.setRecordingSid(livestream.id),
      // add userLivestreamData
      LivestreamSeed.userData({
         user: opts.user,
         livestream,
         registered: opts.registered ?? true,
         participated: opts.participated ?? false,
      }),
   ])

   return { livestream }
}
