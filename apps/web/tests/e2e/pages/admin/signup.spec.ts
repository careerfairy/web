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
import { sleep } from "../../utils"

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

      await sleep(1000)
      await groupPage.clickBackdropIfPresent()

      await use(groupPage)
   },
})

test.describe("Admin Signup", () => {
   test("Sign in with a group admin account should redirect to the group dashboard page", async ({
      groupPage,
   }) => {
      // assert we're on the group dashboard
      expect(groupPage.topCreateLivestreamButton()).toBeVisible()
      await groupPage.assertMainPageHeader()
   })

   // test("Invite a user through the group team members page", async ({
   //    groupPage,
   // }) => {

   //    await groupPage.goToCompanyPage()
   //    await groupPage.goToMembersPage()

   // TODO: coming on stack 2
   // })

   // TODO: test, member can't invite others
})

async function setupData(overrideGroupDetails: Partial<Group> = {}) {
   const group = await GroupSeed.createGroup(
      Object.assign({}, overrideGroupDetails)
   )

   const user = await UserSeed.createUser(credentials.correctEmail)

   await GroupSeed.addGroupAdmin(
      user.authId,
      group.id,
      // can't use GROUP_DASHBOARD_ROLE.OWNER, build fails
      "OWNER" as GROUP_DASHBOARD_ROLE
   )

   return { group, user }
}
