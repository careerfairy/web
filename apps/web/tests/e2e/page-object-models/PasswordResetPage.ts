import { Locator, Page } from "@playwright/test"

export class PasswordResetPage {
   readonly page: Page
   readonly passwordResetButton: Locator
   readonly emailTextField: Locator
   readonly confirmedMessageText: Locator

   constructor(page: Page) {
      this.page = page
      this.passwordResetButton = page.locator(
         '[data-testid="password-reset-button"]'
      )
      this.emailTextField = page.locator('input[name="email"]')
      this.confirmedMessageText = page.locator(
         "text=If you're email is registered, you will shortly receive an email to complete your password reset."
      )
   }

   async clickResetPassword() {
      return this.passwordResetButton?.click()
   }
   async enterEmail(email: string) {
      return this.emailTextField?.fill(email)
   }
}
