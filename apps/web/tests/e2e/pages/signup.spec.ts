import { expect, test } from "@playwright/test"
import UniversitiesSeed from "@careerfairy/seed-data/dist/universities"
import { SignupPage } from "../page-object-models/SignupPage"
import UserSeed from "@careerfairy/seed-data/dist/users"
import InterestSeed from "@careerfairy/seed-data/dist/interests"
import FieldsOfStudySeed from "@careerfairy/seed-data/dist/fieldsOfStudy"
import { correctRegistrationAnalyticsSteps, credentials } from "../../constants"
import { PortalPage } from "../page-object-models/PortalPage"
import { LoginPage } from "../page-object-models/LoginPage"
import { INITIAL_CREDITS } from "@careerfairy/shared-lib/dist/rewards"
import { setupUserSignUpData } from "../setupData"

test.describe("Signup Page Functionality", () => {
   test.beforeAll(async () => {
      //await setupUserSignUpData()
   })

   test.beforeEach(async ({ page }) => {
      await UserSeed.deleteUser(credentials.correctEmail)
      await new SignupPage(page).open()
   })

   test.afterAll(async () => {
      await Promise.all([
         UserSeed.deleteUser(credentials.correctEmail),
         UniversitiesSeed.deleteUniversities(),
         InterestSeed.deleteInterests(),
         FieldsOfStudySeed.deleteCollection("fieldsOfStudy"),
         FieldsOfStudySeed.deleteCollection("levelsOfStudy"),
      ])
   })

   test.only("It successfully redirect to signup to complete the email verification step", async ({
      page,
   }) => {
      const signup = new SignupPage(page)
      const portal = new PortalPage(page)

      const {
         correctPassword,
         correctUniversityCountry,
         correctEmail,
         correctLastName,
         correctFirstName,
         correctFieldOfStudyName,
         correctLevelOfStudyName,
      } = credentials

      await signup.fillSignupForm({
         universityName: `University of ${correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: correctUniversityCountry,
         confirmPassword: correctPassword,
         password: correctPassword,
         email: correctEmail,
         lastName: correctLastName,
         firstName: correctFirstName,
         levelOfStudyName: correctLevelOfStudyName,
         fieldOfStudyName: correctFieldOfStudyName,
      })
      await page.pause()
      await signup.clickSignup()
      await expect(signup.emailVerificationStepMessage).toBeVisible()

      const userData = await UserSeed.getUserData(correctEmail)
      expect(userData).toBeTruthy()
      const validationPin = userData.validationPin
      await signup.enterPinCode(`${validationPin}`)
      await signup.clickValidateEmail()

      // should be on the social information step
      await expect(signup.socialInformationStep).toBeVisible()

      await signup.clickContinueButton()

      // should be on the additional information step
      await expect(signup.additionalInformationStep).toBeVisible()

      await signup.clickContinueButton()

      // should be on the interest information step
      await expect(signup.interestsInformationStep).toBeVisible()

      await signup.clickContinueButton()

      await expect(portal.UpcomingEventsHeader).toBeVisible({
         timeout: 15000,
      })

      const userDataFromDb = await UserSeed.getUserData(correctEmail)

      const {
         linkedinUrl: userDataLinkedinUrl,
         spokenLanguages: userDataSpokenLanguages,
         countriesOfInterest: userDataCountriesOfInterest,
         interestsIds: userDataInterestsIds,
         isLookingForJob: userDataIsLookingForJob,
      } = userDataFromDb

      expect(userDataLinkedinUrl).toBeFalsy()
      expect(userDataIsLookingForJob).toBeFalsy()
      expect(userDataSpokenLanguages).toBeFalsy()
      expect(userDataCountriesOfInterest).toBeFalsy()
      expect(userDataInterestsIds).toBeFalsy()
      expect(userDataFromDb.credits).toBe(INITIAL_CREDITS)
   })

   test("It successfully go to validate email step without gender selected", async ({
      page,
   }) => {
      const signup = new SignupPage(page)

      const {
         correctPassword,
         correctUniversityCountry,
         correctEmail,
         correctLastName,
         correctFirstName,
         correctFieldOfStudyName,
         correctLevelOfStudyName,
      } = credentials

      await signup.fillSignupForm({
         universityName: `University of ${correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: correctUniversityCountry,
         confirmPassword: correctPassword,
         password: correctPassword,
         email: correctEmail,
         lastName: correctLastName,
         firstName: correctFirstName,
         levelOfStudyName: correctLevelOfStudyName,
         fieldOfStudyName: correctFieldOfStudyName,
      })
      await signup.clickSignup()
      await expect(signup.emailVerificationStepMessage).toBeVisible()
   })

   test("It successfully signs up with additional information", async ({
      page,
   }) => {
      const signup = new SignupPage(page)
      const portal = new PortalPage(page)

      const {
         correctPassword,
         correctUniversityCountry,
         correctEmail,
         correctLastName,
         correctFirstName,
         linkedinUrl,
         spokenLanguagesIds: [firstSpokenLanguageId],
         countriesOfInterestIds: [firstCountriesOfInterestId],
         regionsOfInterestIds: [firstRegionOfInterestId],
         interestsIds: [firstInterestsId],
         correctLevelOfStudyName,
         correctFieldOfStudyName,
      } = credentials

      await signup.fillSignupForm({
         universityName: `University of ${correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: correctUniversityCountry,
         confirmPassword: correctPassword,
         password: correctPassword,
         email: correctEmail,
         lastName: correctLastName,
         firstName: correctFirstName,
         levelOfStudyName: correctLevelOfStudyName,
         fieldOfStudyName: correctFieldOfStudyName,
      })
      await signup.clickSignup()
      await expect(signup.emailVerificationStepMessage).toBeVisible()

      const userData = await UserSeed.getUserData(correctEmail)
      expect(userData).toBeTruthy()
      const validationPin = userData.validationPin
      await signup.enterPinCode(`${validationPin}`)
      await signup.clickValidateEmail()

      // should be on the social information step
      await expect(signup.socialInformationStep).toBeVisible()

      await signup.enterLinkedInLinkInput(linkedinUrl)
      await signup.clickContinueButton()

      // should be on the additional information step
      await expect(signup.additionalInformationStep).toBeVisible()

      await signup.selectSpokenLanguageOption(firstSpokenLanguageId)
      await signup.selectCountriesOfInterestOption(firstCountriesOfInterestId)
      await signup.selectCountriesOfInterestOption(firstRegionOfInterestId)
      await signup.selectIsLookingForJobToggleOption()

      await signup.clickContinueButton()

      // should be on the interest information step
      await expect(signup.interestsInformationStep).toBeVisible()

      await signup.selectInterestsInputOption(firstInterestsId)

      await signup.clickContinueButton()

      await expect(portal.UpcomingEventsHeader).toBeVisible({
         timeout: 15000,
      })

      const userDataFromDb = await UserSeed.getUserData(correctEmail)

      const {
         linkedinUrl: userDataLinkedinUrl,
         spokenLanguages: userDataSpokenLanguages,
         countriesOfInterest: userDataCountriesOfInterest,
         regionsOfInterest: userDataRegionsOfInterest,
         interestsIds: userDataInterestsIds,
         isLookingForJob: userDataIsLookingForJob,
      } = userDataFromDb

      expect(userDataLinkedinUrl).toEqual(linkedinUrl)
      expect(userDataIsLookingForJob).toBeTruthy()
      expect(firstSpokenLanguageId).toEqual(userDataSpokenLanguages[0])
      expect(firstCountriesOfInterestId).toEqual(userDataCountriesOfInterest[0])
      expect(firstRegionOfInterestId).toEqual(userDataRegionsOfInterest[0])
      expect(firstInterestsId).toEqual(userDataInterestsIds[0])
   })

   test("It successfully signs up with linkedin as empty since we fill an invalid linkedinUrl one", async ({
      page,
   }) => {
      const signup = new SignupPage(page)
      const portal = new PortalPage(page)

      const {
         correctPassword,
         correctUniversityCountry,
         correctEmail,
         correctLastName,
         correctFirstName,
         wrongLinkedinUrl,
         correctLevelOfStudyName,
         correctFieldOfStudyName,
      } = credentials

      await signup.fillSignupForm({
         universityName: `University of ${correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: correctUniversityCountry,
         confirmPassword: correctPassword,
         password: correctPassword,
         email: correctEmail,
         lastName: correctLastName,
         firstName: correctFirstName,
         levelOfStudyName: correctLevelOfStudyName,
         fieldOfStudyName: correctFieldOfStudyName,
      })
      await signup.clickSignup()
      await expect(signup.emailVerificationStepMessage).toBeVisible()

      await page.goto("/")
      const response = await page.on("response")

      await expect(response.headers().location).toBe("/signup")
      await expect(signup.emailVerificationStepMessage).toBeVisible()
   })

   test("It successfully signs up and save the steps on analytics", async ({
      page,
   }) => {
      const signup = new SignupPage(page)
      const portal = new PortalPage(page)

      const {
         correctPassword,
         correctUniversityCountry,
         correctEmail,
         correctLastName,
         correctFirstName,
         correctLevelOfStudyName,
         correctFieldOfStudyName,
      } = credentials

      await signup.fillSignupForm({
         universityName: `University of ${correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: correctUniversityCountry,
         confirmPassword: correctPassword,
         password: correctPassword,
         email: correctEmail,
         lastName: correctLastName,
         firstName: correctFirstName,
         levelOfStudyName: correctLevelOfStudyName,
         fieldOfStudyName: correctFieldOfStudyName,
      })
      await signup.clickSignup()
      await expect(signup.emailVerificationStepMessage).toBeVisible()

      const userData = await UserSeed.getUserData(correctEmail)
      expect(userData).toBeTruthy()
      const validationPin = userData.validationPin
      await signup.enterPinCode(`${validationPin}`)
      await signup.clickValidateEmail()

      // should be on the social information step
      await expect(signup.socialInformationStep).toBeVisible()

      await signup.clickContinueButton()

      // should be on the additional information step
      await expect(signup.additionalInformationStep).toBeVisible()

      await signup.clickContinueButton()

      // should be on the interest information step
      await expect(signup.interestsInformationStep).toBeVisible()

      await signup.clickContinueButton()

      await expect(portal.UpcomingEventsHeader).toBeVisible({
         timeout: 15000,
      })

      const userDataAnalyticsFromDb = await UserSeed.getUserDataAnalytics(
         correctEmail
      )
      const {
         registrationSteps: { steps, userId },
      } = userDataAnalyticsFromDb
      const { steps: correctSteps, userId: correctUserId } =
         correctRegistrationAnalyticsSteps

      expect(steps).toEqual(correctSteps)
      expect(userId).toEqual(correctUserId)
   })

   test("It should save only once the steps on analytics even if the user goes back and forward", async ({
      page,
   }) => {
      const signup = new SignupPage(page)
      const portal = new PortalPage(page)

      const {
         correctPassword,
         correctUniversityCountry,
         correctEmail,
         correctLastName,
         correctFirstName,
         correctLevelOfStudyName,
         correctFieldOfStudyName,
      } = credentials

      await signup.fillSignupForm({
         universityName: `University of ${correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: correctUniversityCountry,
         confirmPassword: correctPassword,
         password: correctPassword,
         email: correctEmail,
         lastName: correctLastName,
         firstName: correctFirstName,
         levelOfStudyName: correctLevelOfStudyName,
         fieldOfStudyName: correctFieldOfStudyName,
      })
      await signup.clickSignup()
      await expect(signup.emailVerificationStepMessage).toBeVisible()

      const userData = await UserSeed.getUserData(correctEmail)
      expect(userData).toBeTruthy()
      const validationPin = userData.validationPin
      await signup.enterPinCode(`${validationPin}`)
      await signup.clickValidateEmail()

      // should be on the social information step
      await expect(signup.socialInformationStep).toBeVisible()

      await signup.clickContinueButton()

      // should be on the additional information step
      await expect(signup.additionalInformationStep).toBeVisible()

      await signup.clickContinueButton()

      // should be on the interest information step
      await expect(signup.interestsInformationStep).toBeVisible()

      await signup.clickBackButton()

      // should be again on the additional information step
      await expect(signup.additionalInformationStep).toBeVisible()

      await signup.clickContinueButton()

      // should be again on the interest information step
      await expect(signup.interestsInformationStep).toBeVisible()

      await signup.clickContinueButton()

      await expect(portal.UpcomingEventsHeader).toBeVisible({
         timeout: 15000,
      })

      const userDataAnalyticsFromDb = await UserSeed.getUserDataAnalytics(
         correctEmail
      )

      const {
         registrationSteps: { steps, userId },
      } = userDataAnalyticsFromDb
      const { steps: correctSteps, userId: correctUserId } =
         correctRegistrationAnalyticsSteps

      expect(steps).toEqual(correctSteps)
      expect(userId).toEqual(correctUserId)
   })

   test("It fails to sign up with missing fields", async ({
      page,
      browserName,
   }) => {
      const signup = new SignupPage(page)

      await signup.fillSignupForm({})
      await signup.clickSignup()

      if (browserName === "webkit") {
         await signup.clickSignup()
      }

      await Promise.all([
         expect(signup.firstNameRequiredWarning).toBeVisible(),
         expect(signup.lastNameRequiredWarning).toBeVisible(),
         expect(signup.emailRequiredWarning).toBeVisible(),
         expect(signup.passwordRequiredWarning).toBeVisible(),
         expect(signup.confirmPasswordRequiredWarning).toBeVisible(),
         expect(signup.universityCountryRequiredWarning).toBeVisible(),
         expect(signup.agreeToTermsRequiredWarning).toBeVisible(),
      ])
   })
   test("It fails to sign up with miss matching passwords", async ({
      page,
   }) => {
      const signup = new SignupPage(page)

      await signup.fillSignupForm({
         universityName: `University of ${credentials.correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: credentials.correctUniversityCountry,
         confirmPassword: credentials.correctPassword,
         password: credentials.correctPassword + "typo",
         email: credentials.correctEmail,
         lastName: credentials.correctLastName,
         firstName: credentials.correctFirstName,
         levelOfStudyName: credentials.correctLevelOfStudyName,
         fieldOfStudyName: credentials.correctFieldOfStudyName,
      })
      await signup.clickSignup()
      await expect(signup.confirmPasswordMissMatchedWarning).toBeVisible()
   })
   test("It fails to sign up because of already existing registered email", async ({
      page,
   }) => {
      const signup = new SignupPage(page)
      await UserSeed.createUser(credentials.correctEmail)
      await signup.fillSignupForm({
         universityName: `University of ${credentials.correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: credentials.correctUniversityCountry,
         confirmPassword: credentials.correctPassword,
         password: credentials.correctPassword,
         email: credentials.correctEmail,
         lastName: credentials.correctLastName,
         firstName: credentials.correctFirstName,
         levelOfStudyName: credentials.correctLevelOfStudyName,
         fieldOfStudyName: credentials.correctFieldOfStudyName,
      })
      await signup.clickSignup()
      await expect(signup.accountAlreadyExistsWarning).toBeVisible()
      await UserSeed.deleteUser(credentials.correctEmail)
   })
   test("It fails to sign up with incorrectly entered credentials", async ({
      page,
   }) => {
      const signup = new SignupPage(page)
      await signup.fillSignupForm({
         universityName: `University of ${credentials.correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: credentials.correctUniversityCountry,
         confirmPassword: credentials.correctPassword,
         password: credentials.wrongPassword,
         email: credentials.invalidEmailAddress,
         lastName: credentials.wrongFirstName,
         firstName: credentials.wrongLastName,
      })
      await signup.clickSignup()
      await Promise.all([
         expect(signup.incorrectFirstNameWarning).toBeVisible(),
         expect(signup.incorrectLastNameWarning).toBeVisible(),
         expect(signup.incorrectPasswordWarning).toBeVisible(),
         expect(signup.incorrectEmailWarning).toBeVisible(),
         expect(signup.missingFieldOfStudyWarning).toBeVisible(),
         expect(signup.missingLevelOfStudyWarning).toBeVisible(),
      ])
   })

   test("It warns when pin code field is empty or not using numbers", async ({
      page,
   }) => {
      const signup = new SignupPage(page)
      const login = new LoginPage(page)
      await login.createUserAndLogin({ emailVerified: false })
      await expect(signup.emailVerificationStepMessage).toBeVisible()
      await signup.clickValidateEmail()
      await expect(signup.pinCodeRequiredWarning).toBeVisible()
      await signup.enterPinCode("abcd")
      await expect(signup.incorrectlyFormattedPinCodeWarning).toBeVisible()
   })

   test("It resends verification email after a failed attempt and clicking Resend the verification email.", async ({
      page,
   }) => {
      const signup = new SignupPage(page)
      const login = new LoginPage(page)
      const initialUserData = await login.createUserAndLogin({
         emailVerified: false,
      })
      await expect(signup.emailVerificationStepMessage).toBeVisible()
      const initialUserPin = `${initialUserData.validationPin}`
      let differentPin: string
      if ("0000" === initialUserPin) {
         differentPin = "1111"
      } else {
         differentPin = "0000"
      }
      await signup.enterPinCode(differentPin)
      await signup.clickValidateEmail()
      await expect(signup.incorrectPinCodeWarning).toBeVisible()
      await signup.clickResendVerificationEmail()
      await expect(signup.incorrectPinCodeWarning).toBeHidden()
      const userDataWithResetPin = await UserSeed.getUserData(
         initialUserData.userEmail
      )
      const resetUserPin = `${userDataWithResetPin.validationPin}`
      expect(
         initialUserPin === resetUserPin,
         `Validation pin should be different reset. 
         initialUserPin -> (${initialUserPin}) resetUserPin -> (${resetUserPin})`
      ).toBe(false)
   })
})
