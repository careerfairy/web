import { expect } from "@playwright/test"
import UserSeed from "@careerfairy/seed-data/dist/users"
import { expectExactText } from "../utils/assertions"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import LivestreamDialogPage from "../page-object-models/LivestreamDialogPage"
import { signedInFixture as test } from "../fixtures"
import { LoginPage } from "../page-object-models/LoginPage"
import { setupLivestreamData } from "../setupData"
import LivestreamSeed from "@careerfairy/seed-data/dist/livestreams"

test.describe("Livestream Registration Signed In", () => {
   test("successful registration on a livestream event from the portal page", async ({
      page,
      user,
   }) => {
      const { livestream } = await setupLivestreamData()
      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.completeSuccessfulRegistration()
      await livestreamDialogPage.closeDialog()

      // confirm we have the card with the Booked chip
      const livestreamCard = page
         .getByTestId(`livestream-card-${livestream.id}`)
         .first()
      await expect(livestreamCard.getByText("Booked!")).toBeVisible()
      await expect(livestreamCard.getByText(livestream.title)).toBeVisible()

      // confirm the userLivestreamData was created
      await expectUserLivestreamDataCreated(user, livestream)

      // confirm the dialog has the registered state
      await livestreamDialogPage.openDialog()
      await expect(page.getByText("You're registered")).toBeVisible()
      await expect(livestreamDialogPage.cancelRegistrationButton).toBeVisible()

      // cancel registration
      await livestreamDialogPage.cancelRegistrationClick()
      await expect(livestreamDialogPage.registrationButton).toBeVisible()
      await livestreamDialogPage.closeDialog()
      await expect(livestreamCard.getByText("Booked!")).not.toBeVisible()
   })

   test("successful registration on a livestream event with no group questions", async ({
      page,
      user,
   }) => {
      const { livestream } = await setupLivestreamData(undefined, {
         groupQuestionsMap: null,
      })

      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.completeSuccessfulRegistration()
   })

   test("successful registration on a livestream event without group questions and required consent", async ({
      page,
      user,
   }) => {
      const { livestream } = await setupLivestreamData(
         {
            privacyPolicyActive: true,
            privacyPolicyUrl: "https://careerfairy.io",
         },
         {
            groupQuestionsMap: null,
         }
      )

      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.completeSuccessfulRegistration({
         groupConsentRequired: true,
      })
   })

   test("successful registration on a livestream event with both group questions and required consent", async ({
      page,
      user,
   }) => {
      const { livestream } = await setupLivestreamData({
         privacyPolicyActive: true,
         privacyPolicyUrl: "https://careerfairy.io",
      })

      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.completeSuccessfulRegistration({
         groupConsentRequired: true,
      })
   })

   test("register to an event and fill out a question and join talent pool", async ({
      page,
      user,
   }) => {
      const { livestream } = await setupLivestreamData()
      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      const question = "My useful question with 10 chars"

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.completeSuccessfulRegistration({
         joinTalentPool: true,
         questionsViewArgs: {
            questionToAsk: question,
         },
      })

      // assert firestore data is right
      const finalLivestreamData = await LivestreamSeed.getWithSubcollections(
         livestream.id,
         ["questions", "userLivestreamData"]
      )
      expect(finalLivestreamData.questions[0].title).toBe(question)
      expect(finalLivestreamData.userLivestreamData[0].user.userEmail).toBe(
         user.userEmail
      )
      expect(
         finalLivestreamData.userLivestreamData[0].talentPool.date
      ).toBeTruthy()
   })

   test("livestream has already started, confirm the redirection without any registration", async ({
      page,
      user,
      browserName,
   }) => {
      test.skip(
         browserName === "webkit",
         "Temporarily disabled on WebKit until Agora supports Webkit 16.x"
      )

      const { livestream } = await setupLivestreamData(
         {},
         { groupQuestionsMap: null },
         "createLive"
      )
      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      // open page
      await livestreamDialogPage.openDialog()
      expect(await livestreamDialogPage.registrationButton.textContent()).toBe(
         "Join live stream"
      )

      await livestreamDialogPage.registrationButton.click()

      await page.waitForURL(`**/streaming/${livestream.id}/viewer`)

      // assert we're on the streaming page
      expect(page.url()).toContain(`/streaming/${livestream.id}/viewer`)
      await expectExactText(page, "Add a Question")
   })
})

test.describe("Livestream Registration Signed Out", () => {
   test("past event without login should request the user to login to access the recording", async ({
      page,
   }) => {
      const { livestream } = await setupLivestreamData({}, {}, "createPast")
      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await page.goto("/past-livestreams")

      await livestreamDialogPage.openDialog()

      // sign up to watch button should be visible
      await expect(
         page.getByTestId("livestream-signup-watch-button")
      ).toBeVisible()
   })

   test("register to an event without login, login and proceed with registration", async ({
      page,
   }) => {
      const { livestream } = await setupLivestreamData()
      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await page.goto("/portal")

      // open dialog and try to register without login
      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.registrationButton.click()

      // redirection to login
      await page.waitForURL(`**/login?absolutePath**`)

      // create user and login
      const email = "newuser@careerfairy.io"
      await UserSeed.createUser(email)
      await LoginPage.login(page, {
         openPage: false,
         email,
         waitForURL: `**/portal/livestream/${livestream.id}`,
      })

      // livestream dialog should be open after redirect
      await expect(page.getByText(livestream.title).first()).toBeVisible()
      await expect(livestreamDialogPage.registrationButton).toBeVisible()
   })
})

async function expectUserLivestreamDataCreated(
   user: UserData,
   livestream: LivestreamEvent
) {
   const finalLivestreamData = await LivestreamSeed.getWithSubcollections(
      livestream.id,
      ["userLivestreamData"]
   )
   expect(finalLivestreamData.userLivestreamData[0].user.userEmail).toBe(
      user.userEmail
   )
   expect(
      finalLivestreamData.userLivestreamData[0].registered.date
   ).toBeTruthy()
   expect(finalLivestreamData.livestream.registeredUsers).toContain(
      user.userEmail
   )
}
