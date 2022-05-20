import { Locator, Page } from "@playwright/test"
import UserSeed from "@careerfairy/seed-data/dist/users"
import { credentials } from "../../constants"
import { UserData } from "@careerfairy/shared-lib/dist/users"

export class LoginPage {
   readonly page: Page
   readonly emailTextField: Locator
   readonly passwordTextField: Locator
   readonly loginButton: Locator
   readonly portalPageUpcomingHeader: Locator
   readonly portalNextEventsHeader: Locator
   readonly passwordResetLink: Locator
   readonly signupLink: Locator

   constructor(page: Page) {
      this.page = page
      this.passwordTextField = page.locator('input[name="password"]')
      this.emailTextField = page.locator('input[name="email"]')
      this.loginButton = page.locator("data-testid=login-button")
      this.portalPageUpcomingHeader = page.locator("text=COMING UP NEXT")
      this.portalNextEventsHeader = page.locator("text=MY NEXT EVENTS")
      this.passwordResetLink = page.locator(
         "data-testid=forgot-password-page-link"
      )
      this.signupLink = page.locator("data-testid=signup-page-link")
   }

   async enterEmail(email: string) {
      return this.emailTextField?.fill(email)
   }
   async enterPassword(password: string) {
      return this.passwordTextField?.fill(password)
   }
   async clickLogin() {
      return this.loginButton?.click()
   }
   async clickPasswordResetLink() {
      return this.passwordResetLink?.click()
   }
   async clickSignupLinkLink() {
      return this.signupLink?.click()
   }

   async open() {
      await this.page.goto("/login")
   }

   async createUserAndLogin(options?: { emailVerified?: boolean }) {
      const userData = await UserSeed.createUser(
         credentials.correctEmail,
         undefined,
         {
            password: credentials.correctPassword,
            emailVerified: options?.emailVerified ?? true,
         }
      )
      await this.open()
      await this.enterEmail(credentials.correctEmail)
      await this.enterPassword(credentials.correctPassword)
      await this.clickLogin()
      return userData
   }

   /**
    * Utility method to login before running tests
    * @param page
    * @param extraUserData
    */
   static async login(page: Page, extraUserData?: Partial<UserData>) {
      const handler = new LoginPage(page)

      const userData = await UserSeed.createUser(
         credentials.correctEmail,
         extraUserData
      )

      await handler.open()
      await handler.enterEmail(credentials.correctEmail)
      await handler.enterPassword(credentials.defaultPassword)
      await handler.clickLogin()

      await page.waitForURL("/portal")

      return userData
   }
}
