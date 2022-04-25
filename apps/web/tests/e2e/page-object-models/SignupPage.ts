import { Locator, Page, expect } from "@playwright/test"
import { sleep } from "../utils"

export class SignupPage {
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
   readonly userPersonaliseContinueButton: Locator
   readonly validateEmailButton: Locator
   readonly emailVerificationStepMessage: Locator
   readonly interestsTitle: Locator
   readonly universityCountrySelector: Locator
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
   readonly incorrectEmailWarning: Locator

   constructor(page: Page) {
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
      this.page = page
      this.emailTextField = page.locator('input[name="email"]')
      this.firstNameTextField = page.locator('input[name="firstName"]')
      this.lastNameTextField = page.locator('input[name="lastName"]')
      this.passwordTextField = page.locator('input[name="password"]')
      this.passwordConfirmTextField = page.locator(
         'input[name="confirmPassword"]'
      )
      this.interestsTitle = page.locator("text=What are your interests?")
      this.referralCodeTextField = page.locator('input[name="referralCode"]')
      this.termsOfConditionsCheckBox = page.locator('input[name="agreeTerm"]')
      this.subscribeEmailsCheckBox = page.locator('input[name="subscribed"]')
      this.signupButton = page.locator("data-testid=signup-button")
      this.userPersonaliseContinueButton = page.locator(
         "data-testid=user-personalise-continue-button"
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
   }

   async selectUniversityCountry(country: string) {
      return this.handleMultiSelect(country, this.universityCountrySelector)
   }

   async selectUniversity(university: string) {
      return this.handleMultiSelect(university, this.universitySelector)
   }

   async handleMultiSelect(stringToSelect: string, elementLocator: Locator) {
      if (!stringToSelect) return
      await elementLocator.click()
      await elementLocator.focus()
      await elementLocator.fill(stringToSelect)
      expect(await elementLocator.inputValue()).toBe(stringToSelect)
      await this.page
         .locator('div[role="presentation"]', { hasText: stringToSelect })
         .click()
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

   async enterPinCode(pinCode?: string) {
      return pinCode && this.pinCodeTextField.fill(pinCode)
   }
   async agreeToTerms(agree: boolean) {
      if (agree) {
         return this.termsOfConditionsCheckBox.check()
      } else return this.termsOfConditionsCheckBox.uncheck()
   }
   async subscribeToEmails(agree: boolean) {
      if (agree) {
         return this.subscribeEmailsCheckBox.check()
      } else return this.subscribeEmailsCheckBox.uncheck()
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
      return this.userPersonaliseContinueButton?.click()
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
      await this.selectUniversity(formData.universityName)
      await this.enterPassword(formData.password)
      await this.enterConfirmPassword(formData.confirmPassword)
      await this.agreeToTerms(formData.agreeToTerms)
      await sleep(300)
      await this.subscribeToEmails(formData.subscribeEmails)
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
}
