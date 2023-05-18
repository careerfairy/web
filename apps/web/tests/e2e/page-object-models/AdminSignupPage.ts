import { CommonPage } from "./CommonPage"

export class AdminSignupPage extends CommonPage {
   public async openSignupInvite(inviteId: string) {
      await this.openInviteLink(inviteId, "signup")
   }

   public async openSignInInvite(inviteId: string) {
      await this.openInviteLink(inviteId, "signin")
   }

   private openInviteLink(inviteId: string, flow: "signin" | "signup") {
      const inviteLink = `/group/invite/${inviteId}/?flow=${flow}`

      return this.page.goto(inviteLink)
   }

   public async signup(data: {
      firstName: string
      lastName: string
      email: string
      password: string
   }) {
      await this.page.getByLabel("First Name").fill(data.firstName)
      await this.page.getByLabel("Last Name").fill(data.lastName)
      await this.page.getByPlaceholder("Email").fill(data.email)
      await this.page.locator("#password").fill(data.password)
      await this.page.getByLabel("Confirm Password").fill(data.password)
      await this.page
         .getByLabel(
            "I agree to the Terms & Conditions and I have taken note of the Data Protection Notice"
         )
         .check()

      await this.page.getByTestId("signup-button").click()
   }

   public assertSignUpHeader() {
      return this.assertTextIsVisible("Create your admin profile to start")
   }

   public async login(data: { email: string; password: string }) {
      await this.page.getByPlaceholder("Email Address").fill(data.email)
      await this.page.getByPlaceholder("Password").fill(data.password)
      await this.page.getByTestId("login-button").click()
   }
}
