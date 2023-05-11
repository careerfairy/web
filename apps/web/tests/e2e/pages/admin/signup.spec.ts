import { Group } from "@careerfairy/shared-lib/groups"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import UserSeed from "@careerfairy/seed-data/dist/users"
import { test, expect } from "@playwright/test"
import { credentials } from "../../../constants"
import { LoginPage } from "../../page-object-models/LoginPage"
import { GroupDashboardPage } from "../../page-object-models/GroupDashboardPage"
import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/dist/emulators"

test.beforeEach(async () => {
   await clearAuthData()
   await clearFirestoreData()
})

test.describe("Admin Signup", () => {
   test("Sign in with a group admin account should redirect to the group dashboard page", async ({
      page,
   }) => {
      const { group } = await setupData()

      const loginPage = new LoginPage(page)
      const groupPage = new GroupDashboardPage(page, group)

      // login
      await loginPage.open()
      await loginPage.enterEmail(credentials.correctEmail)
      await loginPage.enterPassword(credentials.defaultPassword)
      await loginPage.clickLogin()

      // assert we're on the group dashboard
      await groupPage.clickBackdropIfPresent()
      expect(groupPage.topCreateLivestreamButton()).toBeVisible()
      await groupPage.assertMainPageHeader()
   })
})

async function setupData(overrideGroupDetails: Partial<Group> = {}) {
   const group = await GroupSeed.createGroup(
      Object.assign({}, overrideGroupDetails)
   )

   const user = await UserSeed.createUser(credentials.correctEmail)

   await GroupSeed.addGroupAdmin(user.authId, group.id)

   return { group, user }
}
