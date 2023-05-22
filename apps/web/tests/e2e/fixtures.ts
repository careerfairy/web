import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/dist/emulators"
import { Group, GROUP_DASHBOARD_ROLE } from "@careerfairy/shared-lib/src/groups"
import { UserData } from "@careerfairy/shared-lib/src/users"
import { credentials } from "../constants"
import { GroupDashboardPage } from "./page-object-models/GroupDashboardPage"
import { LoginPage } from "./page-object-models/LoginPage"
import { test as base } from "@playwright/test"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import UserSeed from "@careerfairy/seed-data/dist/users"

/**
 * Group Admin Test Fixture
 * Creates a group and a user (group owner) and logs in the user
 */

export const groupAdminFixture = base.extend<{
   group: Group
   user: UserData
   groupPage: GroupDashboardPage
}>({
   group: async ({}, use) => {
      await clearAuthData()
      await clearFirestoreData()

      const group = await GroupSeed.createGroup()
      await use(group)
   },
   user: async ({ group }, use) => {
      const user = await UserSeed.createUser(credentials.correctEmail)

      await GroupSeed.addGroupAdmin(
         user,
         group,
         "OWNER" as GROUP_DASHBOARD_ROLE
      )

      await use(user)
   },
   groupPage: async ({ page, user, group }, use) => {
      const groupPage = new GroupDashboardPage(page, group)
      await groupPage.setLocalStorageKeys()

      const newUrl = `/group/${group.id}/admin`
      await LoginPage.login(page, { waitForURL: newUrl })

      await use(groupPage)
   },
})
