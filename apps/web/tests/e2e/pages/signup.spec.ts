import { expect, test } from "@playwright/test"
import UniversitiesSeed from "@careerfairy/seed-data/dist/universities"
import { CommonPage } from "../page-object-models/CommonPage"
import { SignupPage } from "../page-object-models/SignupPage"
import UserSeed from "@careerfairy/seed-data/dist/users"
import InterestSeed from "@careerfairy/seed-data/dist/interests"
import { credentials } from "../../constants"
import { PortalPage } from "../page-object-models/PortalPage"
import { checkIfArraysAreEqual } from "../utils"
import { LoginPage } from "../page-object-models/LoginPage"

test.describe("Signup Page Functionality", () => {
   test.beforeAll(async () => {
      await Promise.all([
         InterestSeed.createBasicInterests(),
         UniversitiesSeed.createBasicUniversities(),
      ])
   })

   test.beforeEach(async ({ page }) => {
      await UserSeed.deleteUser(credentials.correctEmail)
      await new SignupPage(page).open()
      await new CommonPage(page).acceptCookies()
   })

   test.afterAll(async () => {
      await Promise.all([
         UserSeed.deleteUser(credentials.correctEmail),
         UniversitiesSeed.deleteUniversities(),
         InterestSeed.deleteInterests(),
      ])
   })

   test("It successfully signs up", async ({ page }) => {
      const signup = new SignupPage(page)
      const portal = new PortalPage(page)

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
      })
      await signup.clickSignup()
      await expect(signup.emailVerificationStepMessage).toBeVisible()

      const userData = await UserSeed.getUserData(credentials.correctEmail)
      await expect(userData).toBeTruthy()
      const validationPin = userData.validationPin
      await signup.enterPinCode(`${validationPin}`)
      await signup.clickValidateEmail()
      await expect(signup.interestsTitle).toBeVisible()
      const dummyInterests = InterestSeed.getDummyInterests()
      const targetInterests = [
         dummyInterests["Startups"],
         dummyInterests["Research & Development"],
         dummyInterests["Business"],
         dummyInterests["Marketing"],
         dummyInterests["Product Management"],
      ]
      const targetInterestNames = targetInterests.map(
         (interest) => interest.name
      )
      const targetInterestIds = targetInterests.map((interest) => interest.id)
      // selects the interests
      await signup.clickOnMultipleInterests(targetInterestNames)
      // de-selects the interests
      await signup.clickOnMultipleInterests(targetInterestNames)
      // re-selects the interests
      await signup.clickOnMultipleInterests(targetInterestNames)

      await signup.clickContinueButton()
      await expect(portal.UpcomingEventsHeader).toBeVisible({
         timeout: 15000,
      })
      const userDataWithInterests = await UserSeed.getUserData(
         credentials.correctEmail
      )
      const userInterests = userDataWithInterests.interestsIds
      const [areEqual, first, second] = checkIfArraysAreEqual(
         userInterests,
         targetInterestIds
      )
      expect(
         areEqual,
         `User's interests on userData Doc should match the selected interests: userData Doc interests -> (${first}) Selected Interests -> (${second})`
      ).toBe(true)
   })
   test("It fails to sign up with missing fields", async ({ page }) => {
      const signup = new SignupPage(page)

      await signup.fillSignupForm({})
      await signup.clickSignup()
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
      await page.pause()
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
