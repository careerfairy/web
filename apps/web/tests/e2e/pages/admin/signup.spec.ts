import { Group, GROUP_DASHBOARD_ROLE } from "@careerfairy/shared-lib/groups"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import UserSeed from "@careerfairy/seed-data/dist/users"
import { test as base, expect } from "@playwright/test"
import { credentials } from "../../../constants"
import { LoginPage } from "../../page-object-models/LoginPage"
import { GroupDashboardPage } from "../../page-object-models/GroupDashboardPage"
import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/dist/emulators"
import { waitForData } from "../../utils"
import ProfilePage from "../../page-object-models/ProfilePage"
import { AdminSignupPage } from "../../page-object-models/AdminSignupPage"

/**
 * Test Fixture
 * Setup Pages and requirements
 */
const test = base.extend<{
   group: Group
   groupPage: GroupDashboardPage
}>({
   group: async ({}, use) => {
      await clearAuthData()
      await clearFirestoreData()

      const { group } = await setupData()

      await use(group)
   },
   groupPage: async ({ page, group }, use) => {
      const newUrl = `/group/${group.id}/admin`
      await LoginPage.login(page, { waitForURL: newUrl })

      const groupPage = new GroupDashboardPage(page, group)

      await groupPage.clickBackdropIfPresent()

      await use(groupPage)
   },
})

test.describe("Admin Signup", () => {
   test("Sign in with a group admin account should redirect to the group dashboard page", async ({
      groupPage,
   }) => {
      // assert we're on the group dashboard
      await groupPage.assertGroupDashboardIsOpen()
   })

   test("Group admin should have the group in the profile > groups page", async ({
      groupPage,
      group,
   }) => {
      const profilePage = new ProfilePage(groupPage.page)
      await profilePage.openGroups()

      await expect(
         groupPage.page.getByRole("heading", { name: group.universityName })
      ).toBeVisible()
   })

   test("Invite a new user through the group team members page to be group admin", async ({
      groupPage,
      group,
      context,
   }) => {
      // create invite
      await groupPage.goToCompanyPage()
      await groupPage.goToMembersPage()
      await groupPage.inviteGroupAdmin(creds.email)

      // confirm the invite works
      const inviteDoc = await waitForData(() =>
         GroupSeed.getInviteByEmail(creds.email)
      )

      // new browser context without any auth
      const inviteContext = await context.browser().newContext()
      const adminPage = new AdminSignupPage(await inviteContext.newPage())

      // open invite link
      await adminPage.openSignupInvite(inviteDoc.id)
      await adminPage.assertSignUpHeader()

      // fill sign up form & submit
      await adminPage.signup(creds)

      // confirm we're on the group dashboard
      const newGroupPage = new GroupDashboardPage(adminPage.page, group)
      await newGroupPage.clickBackdropIfPresent()
      // assert we're on the group dashboard
      await newGroupPage.assertGroupDashboardIsOpen()

      // clear resources
      await inviteContext.close()
   })

   test("Invite an existing user through the group team members page to be group admin", async ({
      groupPage,
      group,
      context,
   }) => {
      // create the user we'll invite
      const user = await UserSeed.createUser(creds.email)

      // create invite
      await groupPage.goToCompanyPage()
      await groupPage.goToMembersPage()
      await groupPage.inviteGroupAdmin(user.userEmail)

      const inviteDoc = await waitForData(() =>
         GroupSeed.getInviteByEmail(user.userEmail)
      )

      // new browser context without any auth
      const inviteContext = await context.browser().newContext()
      const adminPage = new AdminSignupPage(await inviteContext.newPage())

      // open invite link and login
      await adminPage.openSignInInvite(inviteDoc.id)
      await adminPage.login({ email: user.userEmail, password: "password" })

      // confirm we're on the group dashboard
      const newGroupPage = new GroupDashboardPage(adminPage.page, group)
      await newGroupPage.clickBackdropIfPresent()
      // assert we're on the group dashboard
      await newGroupPage.assertGroupDashboardIsOpen()

      // a group member can't invite others, only the group owner..
      await newGroupPage.goToCompanyPage()
      await newGroupPage.goToMembersPage()
      await expect(newGroupPage.inviteMemberButton).not.toBeVisible()
      // also can't kick others
      await expect(newGroupPage.kickFromDashboard).not.toBeVisible()

      // clear resources
      await inviteContext.close()
   })
})

const creds = {
   firstName: "Ron",
   lastName: "Swanson",
   email: "ron@careerfairy.io",
   password: "password123A",
}

async function setupData(overrideGroupDetails: Partial<Group> = {}) {
   const group = await GroupSeed.createGroup(
      Object.assign({}, overrideGroupDetails)
   )

   const user = await UserSeed.createUser(credentials.correctEmail)

   await GroupSeed.addGroupAdmin(
      user,
      group,
      // can't use GROUP_DASHBOARD_ROLE.OWNER, build fails
      "OWNER" as GROUP_DASHBOARD_ROLE
   )

   return { group, user }
}
