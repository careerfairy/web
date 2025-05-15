import LivestreamSeed from "@careerfairy/seed-data/dist/livestreams"
import UserSeed from "@careerfairy/seed-data/dist/users"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { expect } from "@playwright/test"
import { signedInFixture as test } from "../fixtures"
import LivestreamDialogPage from "../page-object-models/LivestreamDialogPage"
import { LoginPage } from "../page-object-models/LoginPage"
import { SignupPage } from "../page-object-models/SignupPage"
import { setupLivestreamData, setupUserSignUpData } from "../setupData"
import { expectExactText } from "../utils/assertions"

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

      await livestreamCard.scrollIntoViewIfNeeded()

      await expect(livestreamCard.getByText("Registered")).toBeVisible()
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
      await expect(livestreamCard.getByText("Registered")).not.toBeVisible()
   })

   test("successful registration on a livestream event with no group questions", async ({
      page,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user,
   }) => {
      const { livestream } = await setupLivestreamData(undefined, {
         overrideLivestreamDetails: {
            groupQuestionsMap: null,
         },
      })

      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.completeSuccessfulRegistration()
   })

   test("successful registration on a livestream event without group questions and required consent", async ({
      page,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user,
   }) => {
      const { livestream } = await setupLivestreamData(undefined, {
         overrideGroupDetails: {
            privacyPolicyActive: true,
            privacyPolicyUrl: "https://careerfairy.io",
         },
         overrideLivestreamDetails: {
            groupQuestionsMap: null,
         },
      })

      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.completeSuccessfulRegistration({
         groupConsentRequired: true,
      })
   })

   test("successful registration on a livestream event with both group questions and required consent", async ({
      page,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user,
   }) => {
      const { livestream } = await setupLivestreamData(undefined, {
         overrideGroupDetails: {
            privacyPolicyActive: true,
            privacyPolicyUrl: "https://careerfairy.io",
         },
      })

      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.completeSuccessfulRegistration({
         groupConsentRequired: true,
      })
   })

   test("should show recommendations ordered by similarity to reference livestream", async ({
      page,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user,
   }) => {
      // Create a reference livestream with specific industry and country
      const { livestream: referenceLivestream } = await setupLivestreamData(
         undefined,
         {
            overrideLivestreamDetails: {
               title: "Reference Livestream",
               companyIndustries: ["Software", "IT"],
               companyCountries: ["Germany", "France"],
            },
         }
      )

      // Create livestreams with varying similarity to test recommendation ordering:
      const [industryAndLocationMatch, industryMatchOnly] = await Promise.all([
         // Priority 1: Matching both industry AND location
         LivestreamSeed.createUpcoming({
            title: "P1: Industry & Location Match",
            companyIndustries: ["Software"],
            companyCountries: ["Germany"],
         }),

         // Priority 2: Matching industry BUT different location
         LivestreamSeed.createUpcoming({
            title: "P2: Industry Match Only",
            companyIndustries: ["IT"],
            companyCountries: ["USA"],
         }),

         // Additional streams that should not match P1 or P2 criteria
         LivestreamSeed.createUpcoming({
            title: "Other Stream 1",
            companyIndustries: ["Healthcare"],
            companyCountries: ["France"],
         }),

         LivestreamSeed.createUpcoming({
            title: "Other Stream 2",
            companyIndustries: ["Finance"],
            companyCountries: ["Canada"],
         }),

         LivestreamSeed.createUpcoming({
            title: "Other Stream 3",
            companyIndustries: ["Healthcare"],
            companyCountries: ["Canada"],
         }),

         LivestreamSeed.createUpcoming({
            title: "Other Stream 4",
            companyIndustries: ["Education"],
            companyCountries: ["Australia"],
         }),

         LivestreamSeed.createUpcoming({
            title: "Other Stream 5",
            companyIndustries: ["Retail"],
            companyCountries: ["Japan"],
         }),
      ])

      // Use the reference livestream for registration
      const livestreamDialogPage = new LivestreamDialogPage(
         page,
         referenceLivestream
      )

      await livestreamDialogPage.openDialog()

      // Complete the registration process
      await livestreamDialogPage.completeSuccessfulRegistration()

      // Wait for and verify recommendations section appears
      await livestreamDialogPage.waitForRecommendationsToAppear()

      // Verify recommendations grid is visible and contains events
      await livestreamDialogPage.verifyRecommendationsGridVisible()

      // Get all recommendation cards
      const recommendationCards =
         await livestreamDialogPage.getRecommendationCards()

      // Ensure we only see 6 cards (UX requirement)
      expect(recommendationCards.length).toBeLessThanOrEqual(6)

      // Verify the first card is P1 (Industry & Location Match)
      const firstCardTitle = await recommendationCards[0]
         .locator("[data-testid^='livestream-card-title-']")
         .textContent()
      expect(firstCardTitle).toBe(industryAndLocationMatch.title)

      // Verify the second card is P2 (Industry Match Only)
      const secondCardTitle = await recommendationCards[1]
         .locator("[data-testid^='livestream-card-title-']")
         .textContent()
      expect(secondCardTitle).toBe(industryMatchOnly.title)

      // Verify we can close the dialog after seeing recommendations
      await livestreamDialogPage.closeDialog()
   })

   test("should allow navigating to a recommended event after registration", async ({
      page,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user,
   }) => {
      const { livestream } = await setupLivestreamData()

      // Create multiple livestreams to ensure we have recommendations
      await Promise.all([
         LivestreamSeed.createUpcoming({
            title: "Recommendation Stream 1",
         }),
         LivestreamSeed.createUpcoming({
            title: "Recommendation Stream 2",
         }),
         LivestreamSeed.createUpcoming({
            title: "Recommendation Stream 3",
         }),
      ])

      // Use the first created livestream for registration
      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      await livestreamDialogPage.openDialog()

      // Complete the registration process
      await livestreamDialogPage.completeSuccessfulRegistration()

      // Wait for recommendations to appear
      await livestreamDialogPage.waitForRecommendationsToAppear()

      // Click on the first recommended event
      const clickedEventTitle =
         await livestreamDialogPage.clickOnFirstRecommendedEvent()

      // Verify the dialog now shows details for the clicked event
      await expect(livestreamDialogPage.livestreamDialogTitle).toHaveText(
         clickedEventTitle
      )

      // Make sure we clicked on a recommendation (not the original event)
      expect(clickedEventTitle).not.toEqual(livestream.title)

      // Verify we can register for this event too
      await expect(livestreamDialogPage.registrationButton).toBeVisible()
   })

   // Talent pool has been removed from the registration process
   test.skip("register to an event and fill out a question and join talent pool", async ({
      page,
      user,
   }) => {
      const { livestream } = await setupLivestreamData()
      const livestreamDialogPage = new LivestreamDialogPage(page, livestream)

      const question = "My useful question with 10 chars"

      await livestreamDialogPage.openDialog()
      await livestreamDialogPage.completeSuccessfulRegistration({
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      user,
      browserName,
   }) => {
      test.skip(
         browserName === "webkit",
         "Temporarily disabled on WebKit until Agora supports Webkit 16.x"
      )

      const { livestream } = await setupLivestreamData(undefined, {
         overrideLivestreamDetails: {
            groupQuestionsMap: null,
            useOldUI: true,
         },
         livestreamType: "createLive",
      })

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
   test.skip("past event without login should request the user to login to access the recording", async ({
      page,
   }) => {
      const { livestream } = await setupLivestreamData(undefined, {
         livestreamType: "createPast",
      })
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
      const email = UserSeed.getRandomEmail()
      await UserSeed.createUser(email)
      await LoginPage.login(page, {
         openPage: false,
         email,
         waitForURL: `**/portal/livestream/${livestream.id}/register`,
      })

      // livestream dialog should be open after redirect
      await expect(page.getByText(livestream.title).first()).toBeVisible()

      // Wait for the URL to redirect to the livestream registration page
      await page.waitForURL(`**/portal/livestream/${livestream.id}/register`)
   })

   test.skip("register to an event without login, create an account and proceed with registration", async ({
      page,
   }) => {
      await setupUserSignUpData()

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
      const email = UserSeed.getRandomEmail()
      await signup.signupUser(email)

      // Wait for the URL to redirect to the livestream registration page 1st step of the registration process
      await page.waitForURL(`**/portal/livestream/${livestream.id}/register`)
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
}
