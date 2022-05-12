import { test, expect } from "@playwright/test"
import UserSeed from "@careerfairy/seed-data/dist/users"
import { credentials } from "../../constants"
import { LoginPage } from "../page-object-models/LoginPage"
import { CommonPage } from "../page-object-models/CommonPage"
import { PortalPage } from "../page-object-models/PortalPage"
import { SignupPage } from "../page-object-models/SignupPage"
import { PasswordResetPage } from "../page-object-models/PasswordResetPage"

test.describe("Login Page Functionality", () => {
   test.afterAll(async () => {
      await UserSeed.deleteUser(credentials.correctEmail)
   })
   test.beforeEach(async ({ page }) => {
      await UserSeed.deleteUser(credentials.correctEmail)
      await UserSeed.createUser(credentials.correctEmail, undefined, {
         password: credentials.correctPassword,
      })
      await new LoginPage(page).open()
   })

   test("It successfully logs in", async ({ page }) => {
      const login = new LoginPage(page)
      const portal = new PortalPage(page)

      await login.enterEmail(credentials.correctEmail)
      await login.enterPassword(credentials.correctPassword)
      await login.clickLogin()
      await expect(portal.UpcomingEventsHeader).toBeVisible({ timeout: 15000 })
   })

   test("It fails to log in with wrong password", async ({ page }) => {
      const login = new LoginPage(page)
      await login.enterEmail(credentials.correctEmail)
      await login.enterPassword(credentials.wrongPassword)
      await login.clickLogin()
      await expect(
         login.page.locator("text=Your password or email is invalid.")
      ).toBeVisible()
   })

   test("It fails to log in with unregistered email address", async ({
      page,
   }) => {
      const login = new LoginPage(page)
      await login.enterEmail(credentials.unregisteredEmail)
      await login.enterPassword(credentials.correctPassword)
      await login.clickLogin()
      await expect(
         login.page.locator(
            "text=No account associated with this email address."
         )
      ).toBeVisible()
   })

   test("It fails to log in with invalid email address", async ({ page }) => {
      const login = new LoginPage(page)
      await login.enterEmail(credentials.invalidEmailAddress)
      await login.enterPassword(credentials.correctPassword)
      await login.clickLogin()
      await expect(
         login.page.locator("text=Please enter a valid email address")
      ).toBeVisible()
   })

   test("It fails to log in with with no email address", async ({ page }) => {
      const login = new LoginPage(page)
      await login.enterPassword(credentials.correctPassword)
      await login.clickLogin()
      await expect(
         login.page.locator("text=Your email is required")
      ).toBeVisible()
   })

   test("It fails to log in with with no password", async ({ page }) => {
      const login = new LoginPage(page)
      await login.enterEmail(credentials.correctEmail)
      await login.clickLogin()
      await expect(
         login.page.locator("text=A password is required")
      ).toBeVisible()
   })

   test("It goes to reset password page from login page and attempts to reset password", async ({
      page,
   }) => {
      const login = new LoginPage(page)
      const passwordReset = new PasswordResetPage(page)
      await login.clickPasswordResetLink()
      await expect(passwordReset.passwordResetButton).toBeVisible()
      await passwordReset.enterEmail(credentials.correctEmail)
      await passwordReset.clickResetPassword()
      await expect(passwordReset.confirmedMessageText).toBeVisible()
   })

   test("click signup button and goes to signup page", async ({ page }) => {
      const login = new LoginPage(page)
      const signup = new SignupPage(page)
      await login.clickSignupLinkLink()
      await signup.expectSignupFormIsVisible()
   })

   test("It redirects to portal page when logged in", async ({ page }) => {
      const login = new LoginPage(page)
      const portal = new PortalPage(page)
      await UserSeed.deleteUser(credentials.correctEmail)
      await login.createUserAndLogin()
      await expect(portal.UpcomingEventsHeader).toBeVisible({ timeout: 15000 })
   })
   test("It redirects to signup page when logged in with unverified email", async ({
      page,
   }) => {
      const login = new LoginPage(page)
      const signup = new SignupPage(page)
      await UserSeed.deleteUser(credentials.correctEmail)
      await login.createUserAndLogin({ emailVerified: false })
      await expect(signup.emailVerificationStepMessage).toBeVisible()
   })
})
