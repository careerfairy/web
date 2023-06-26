import { expect, Locator, Page } from "@playwright/test"
import { sleep } from "../utils"
import { CommonPage, handleMultiSelect } from "./CommonPage"
import { credentials } from "../../constants"
import UserSeed from "@careerfairy/seed-data/dist/users"

export class SignupPage extends CommonPage {
   readonly page: Page
   readonly emailTextField: Locator
   readonly firstNameTextField: Locator
   readonly lastNameTextField: Locator
   readonly passwordTextField: Locator
   readonly passwordConfirmTextField: Locator
   readonly referralCodeTextField: Locator
   readonly termsOfConditionsCheckBox: Locator
   readonly subscribeEmailsCheckBox: Locator
   readonly signupButton: Locator
   readonly userRegistrationContinueButton: Locator
   readonly userRegistrationBackButton: Locator
   readonly validateEmailButton: Locator
   readonly emailVerificationStepMessage: Locator
   readonly interestsTitle: Locator
   readonly universityCountrySelector: Locator
   readonly fieldOfStudySelector: Locator
   readonly levelOfStudySelector: Locator
   readonly universitySelector: Locator
   readonly firstNameRequiredWarning: Locator
   readonly lastNameRequiredWarning: Locator
   readonly emailRequiredWarning: Locator
   readonly passwordRequiredWarning: Locator
   readonly pinCodeTextField: Locator
   readonly pinCodeRequiredWarning: Locator
   readonly incorrectlyFormattedPinCodeWarning: Locator
   readonly incorrectPinCodeWarning: Locator
   readonly confirmPasswordRequiredWarning: Locator
   readonly confirmPasswordMissMatchedWarning: Locator
   readonly universityCountryRequiredWarning: Locator
   readonly agreeToTermsRequiredWarning: Locator
   readonly accountAlreadyExistsWarning: Locator
   readonly incorrectFirstNameWarning: Locator
   readonly incorrectLastNameWarning: Locator
   readonly incorrectPasswordWarning: Locator
   readonly missingFieldOfStudyWarning: Locator
   readonly missingLevelOfStudyWarning: Locator
   readonly incorrectEmailWarning: Locator
   readonly socialInformationStep: Locator
   readonly linkedInLinkInput: Locator
   readonly additionalInformationStep: Locator
   readonly interestsInformationStep: Locator
   readonly spokenLanguagesInput: Locator
   readonly countriesOfInterestInput: Locator
   readonly interestsInput: Locator
   readonly isLookingForJobToggle: Locator

   constructor(page: Page) {
      super(page)

      this.incorrectEmailWarning = page.locator(
         "text=Please enter a valid email address"
      )
      this.incorrectFirstNameWarning = page.locator(
         "text=Please enter a valid first name"
      )
      this.incorrectLastNameWarning = page.locator(
         "text=Please enter a valid last name"
      )
      this.pinCodeRequiredWarning = page.locator("text=A PIN code is required")
      this.incorrectlyFormattedPinCodeWarning = page.locator(
         "text=The PIN code must be a number between 0 and 9999"
      )
      this.incorrectPinCodeWarning = page.locator(
         "text=Incorrect PIN The PIN code you entered appears to be incorrect. Resend the verification email."
      )
      this.incorrectPasswordWarning = page.locator(
         "text=Your password needs to be at least 6 characters long and contain at least one up"
      )
      this.missingFieldOfStudyWarning = page.locator(
         "text=Please select a field of study"
      )
      this.missingLevelOfStudyWarning = page.locator(
         "text=Please select a level of study"
      )
      this.page = page
      this.emailTextField = page.locator('input[name="email"]')
      this.firstNameTextField = page.locator('input[name="firstName"]')
      this.lastNameTextField = page.locator('input[name="lastName"]')
      this.passwordTextField = page.locator('input[name="password"]')
      this.passwordConfirmTextField = page.locator(
         'input[name="confirmPassword"]'
      )
      this.interestsTitle = page.locator("text=What are your interests?")
      this.referralCodeTextField = page.locator("id=referralCode")
      this.termsOfConditionsCheckBox = page.locator('input[name="agreeTerm"]')
      this.subscribeEmailsCheckBox = page.locator('input[name="subscribed"]')
      this.signupButton = page.locator("data-testid=signup-button")
      this.userRegistrationContinueButton = page.locator(
         "data-testid=user-registration-continue-button"
      )
      this.userRegistrationBackButton = page.locator(
         "data-testid=user-registration-back-button"
      )
      this.emailVerificationStepMessage = page.locator(
         "text=We have just sent you an email containing a 4-digit PIN code. Please enter this "
      )
      this.validateEmailButton = page.locator(
         "data-testid=validate-email-button"
      )
      this.pinCodeTextField = page.locator('input[name="pinCode"]')
      this.universityCountrySelector = page.locator(
         'input[name="universityCountryCode"]'
      )
      this.fieldOfStudySelector = page.locator('input[name="fieldOfStudy"]')
      this.levelOfStudySelector = page.locator('input[name="levelOfStudy"]')
      this.universitySelector = page.locator('input[name="university"]')
      this.firstNameRequiredWarning = page.locator(
         "text=Your first name is required"
      )
      this.lastNameRequiredWarning = page.locator(
         "text=Your last name is required"
      )
      this.emailRequiredWarning = page.locator("text=Your email is required")
      this.passwordRequiredWarning = page.locator("text=A password is required")
      this.confirmPasswordRequiredWarning = page.locator(
         "text=You need to confirm your password"
      )
      this.confirmPasswordMissMatchedWarning = page.locator(
         "text=Your password was not confirmed correctly"
      )
      this.agreeToTermsRequiredWarning = page.locator(
         "text=Please agree to our T&C and our Privacy Policy"
      )

      this.universityCountryRequiredWarning = page.locator(
         "text=Please chose a country code"
      )
      this.accountAlreadyExistsWarning = page.locator(
         "text=Error: The email address is already in use by another account."
      )
      this.socialInformationStep = page.locator(
         "data-testid=registration-social-information-step"
      )
      this.linkedInLinkInput = page.locator("id=linkedInLink")
      this.additionalInformationStep = page.locator(
         "data-testid=registration-additional-information-step"
      )
      this.interestsInformationStep = page.locator(
         "data-testid=registration-interests-information-step"
      )
      this.spokenLanguagesInput = page.locator("id=spokenLanguages")
      this.countriesOfInterestInput = page.locator("id=countriesOfInterest")
      this.interestsInput = page.locator("id=interestsIds")
      this.isLookingForJobToggle = page.locator("id=isLookingForJob")
   }

   async selectUniversityCountry(country: string) {
      return handleMultiSelect(
         country,
         this.universityCountrySelector,
         this.page
      )
   }
   async selectFieldOfStudy(fieldOfStudyName: string) {
      return handleMultiSelect(
         fieldOfStudyName,
         this.fieldOfStudySelector,
         this.page
      )
   }
   async selectLevelOfStudy(levelOfStudyName: string) {
      return handleMultiSelect(
         levelOfStudyName,
         this.levelOfStudySelector,
         this.page
      )
   }

   async selectUniversity(university: string) {
      return handleMultiSelect(university, this.universitySelector, this.page)
   }

   async enterEmail(email?: string) {
      return email && this.emailTextField?.fill(email)
   }
   async enterFirstName(firstName?: string) {
      return firstName && this.firstNameTextField?.fill(firstName)
   }
   async enterLastName(lastName?: string) {
      return lastName && this.lastNameTextField?.fill(lastName)
   }
   async enterPassword(password?: string) {
      return password && this.passwordTextField?.fill(password)
   }
   async enterConfirmPassword(password?: string) {
      return password && this.passwordConfirmTextField?.fill(password)
   }
   async enterLinkedInLinkInput(link: string) {
      await this.linkedInLinkInput.fill(link)
      // to let debounce run
      await this.referralCodeTextField.fill("")
      await sleep(1200)
   }

   async enterPinCode(pinCode?: string) {
      return pinCode && this.pinCodeTextField.fill(pinCode)
   }
   async agreeToTerms(agree: boolean) {
      return this.resilientCheck(this.termsOfConditionsCheckBox, agree)
   }
   subscribeToEmails(agree: boolean) {
      return this.resilientCheck(this.subscribeEmailsCheckBox, agree)
   }

   async clickValidateEmail() {
      return this.validateEmailButton?.click()
   }

   async clickResendVerificationEmail() {
      return this.page.locator("text=Resend the verification email.").click()
   }
   async clickSignup() {
      return this.signupButton?.click()
   }
   async clickContinueButton() {
      return this.userRegistrationContinueButton?.click()
   }
   async clickBackButton() {
      return this.userRegistrationBackButton?.click()
   }
   async selectSpokenLanguageOption(optionId: string) {
      await this.spokenLanguagesInput.click()
      await this.page
         .locator(`data-testid=spokenLanguages_${optionId}_option`)
         ?.click()
      await this.spokenLanguagesInput.click()
   }
   async selectCountriesOfInterestOption(optionId: string) {
      await this.countriesOfInterestInput.click()
      await this.page
         .locator(`data-testid=countriesOfInterest_${optionId}_option`)
         ?.click()
      await this.countriesOfInterestInput.click()
   }
   async selectInterestsInputOption(optionId: string) {
      await this.interestsInput.click()
      await this.page
         .locator(`data-testid=interestsIds_${optionId}_option`)
         ?.click()
      await this.interestsInput.click()
   }
   async selectIsLookingForJobToggleOption() {
      return this.isLookingForJobToggle.click()
   }

   async open() {
      await this.page.goto("/signup")
   }

   async expectSignupFormIsVisible() {
      return await Promise.all([
         expect(this.emailTextField).toBeVisible(),
         expect(this.passwordTextField).toBeVisible(),
         expect(this.firstNameTextField).toBeVisible(),
         expect(this.lastNameTextField).toBeVisible(),
         expect(this.universitySelector).toBeVisible(),
         expect(this.universityCountrySelector).toBeVisible(),
      ])
   }

   async fillSignupForm(formData: SignupFormData) {
      await this.enterFirstName(formData.firstName)
      await this.enterLastName(formData.lastName)
      await this.enterEmail(formData.email)
      await this.selectUniversityCountry(formData.universityCountry)
      await this.selectFieldOfStudy(formData.fieldOfStudyName)
      await this.selectLevelOfStudy(formData.levelOfStudyName)
      await this.selectUniversity(formData.universityName)
      await this.enterPassword(formData.password)
      await this.enterConfirmPassword(formData.confirmPassword)
      await this.agreeToTerms(formData.agreeToTerms ?? false)
      await sleep(300)
      await this.subscribeToEmails(formData.subscribeEmails ?? false)
   }

   async fillReferralCode(referralCode: string) {
      await Promise.all([
         this.page.getByPlaceholder("Enter a Referral Code").fill(referralCode),
         this.page.waitForResponse(`**/applyReferralCode_eu`),
      ])
   }

   async signupUser(email?: string) {
      const {
         correctPassword,
         correctUniversityCountry,
         correctEmail,
         correctLastName,
         correctFirstName,
         correctFieldOfStudyName,
         correctLevelOfStudyName,
      } = credentials

      const usedEmail = email ?? correctEmail

      await this.fillSignupForm({
         universityName: `University of ${correctUniversityCountry}`,
         agreeToTerms: true,
         subscribeEmails: true,
         universityCountry: correctUniversityCountry,
         confirmPassword: correctPassword,
         password: correctPassword,
         email: usedEmail,
         lastName: correctLastName,
         firstName: correctFirstName,
         levelOfStudyName: correctLevelOfStudyName,
         fieldOfStudyName: correctFieldOfStudyName,
      })

      await this.clickSignup()
      await expect(this.emailVerificationStepMessage).toBeVisible()

      const userData = await UserSeed.getUserData(usedEmail)
      const validationPin = userData.validationPin
      await this.enterPinCode(`${validationPin}`)
      await this.clickValidateEmail()

      await this.clickContinueButton()
      await this.clickContinueButton()
      await this.clickContinueButton()
   }

   async clickOnMultipleInterests(interests: string[]) {
      for (const interest of interests) {
         await this.clickOnInterest(interest)
      }
      return
   }

   async clickOnInterest(interestName: string) {
      return this.page
         .locator(`div[role="button"]:has-text("${interestName}")`)
         .click({ delay: 200 })
   }
}
//
interface SignupFormData {
   firstName?: string
   lastName?: string
   email?: string
   password?: string
   confirmPassword?: string
   agreeToTerms?: boolean
   subscribeEmails?: boolean
   universityCountry?: string
   universityName?: string
   fieldOfStudyName?: string
   levelOfStudyName?: string
}
