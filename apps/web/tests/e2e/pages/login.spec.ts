import { test, expect } from "@playwright/test"
import UniversitiesSeed from "@careerfairy/seed-data/dist/universities"
import UserSeed from "@careerfairy/seed-data/dist/users"
import { credentials } from "../../constants"

test.beforeAll(async () => {
   await Promise.all([
      UniversitiesSeed.createBasicUniversities(),
      // @ts-ignore
      UserSeed.createUser(credentials.correctEmail, {
         firstName: "John",
         lastName: "Doe",
         university: { code: "CH", name: "University of ETH" },
         universityCountryCode: "CH",
      }),
   ])
})

test.afterAll(async () => {
   await UniversitiesSeed.deleteUniversities()
   await UserSeed.deleteUser(credentials.correctEmail)
})

test.beforeEach(async ({ page }) => {
   await page.goto("/login")
   // Accept cookies
   await page.click("id=rcc-confirm-button")
})

test.describe("Login Page Functionality", () => {
   test("Successfully logs in", async ({ page }) => {
      await page.fill('input[name="email"]', credentials.correctEmail)
      await page.fill('input[name="password"]', credentials.correctPassword)
      await page.click("data-testid=login-button")
      await expect(page.locator("text=COMING UP NEXT")).toBeVisible()
      await expect(page.locator("text=MY NEXT EVENTS")).toBeVisible()
   })

   test("Fails to log in with wrong password", async ({ page }) => {
      await page.fill('input[name="email"]', credentials.correctEmail)
      await page.fill('input[name="password"]', credentials.wrongPassword)
      await page.click("data-testid=login-button")
      await expect(
         page.locator("text=Your password or email is invalid.")
      ).toBeVisible()
   })
   test("Fails to log in with unregistered email address", async ({ page }) => {
      await page.fill('input[name="email"]', credentials.unregisteredEmail)
      await page.fill('input[name="password"]', credentials.correctPassword)
      await page.click("data-testid=login-button")
      await expect(
         page.locator("text=No account associated with this email address.")
      ).toBeVisible()
   })

   test("Fails to log in with invalid email address", async ({ page }) => {
      await page.fill('input[name="email"]', credentials.invalidEmailAddress)
      await page.fill('input[name="password"]', credentials.correctPassword)
      await page.click("data-testid=login-button")
      await expect(
         page.locator("text=Please enter a valid email address")
      ).toBeVisible()
   })
   test("Fails to log in with with no email address", async ({ page }) => {
      await page.fill('input[name="password"]', credentials.correctPassword)
      await page.click("data-testid=login-button")
      await expect(page.locator("text=Your email is required")).toBeVisible()
   })
   test("Fails to log in with with no password", async ({ page }) => {
      await page.fill('input[name="email"]', credentials.correctEmail)
      await page.click("data-testid=login-button")
      await expect(page.locator("text=A password is required")).toBeVisible()
   })
   test("Goes to reset password page from login page and attempts to reset password", async ({
      page,
   }) => {
      await page.click("data-testid=forgot-password-page-link")
      await expect(page.locator("id=resetPasswordForm")).toBeVisible()
      await page.fill('input[name="email"]', credentials.correctEmail)
      await page.click("data-testid=password-reset-button")
      await expect(
         page.locator(
            "text=If you're email is registered, you will shortly receive an email to complete your password reset."
         )
      ).toBeVisible()
   })
   test("click signup button and goes to signup page", async ({ page }) => {
      await page.click("data-testid=signup-page-link")
      await expect(page.locator("data-testid=signup-page-form")).toBeVisible()
   })
})
