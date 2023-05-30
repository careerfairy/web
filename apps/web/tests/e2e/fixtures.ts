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
import InterestSeed from "@careerfairy/seed-data/dist/interests"
import { Interest } from "@careerfairy/shared-lib/src/interests"

type GroupAdminFixtureOptions = {
   /**
    * give the option for tests to not create a user
    */
   createUser?: boolean
   /**
    * give the option to create a complete group
    */
   completedGroup?: boolean
}

/**
 * Group Admin Test Fixture
 *
 * Creates a group and a user (group owner) and signs in the user
 */
export const groupAdminFixture = base.extend<{
   options: GroupAdminFixtureOptions
   group: Group
   user: UserData
   groupPage: GroupDashboardPage
   interests: Interest[]
}>({
   options: {
      createUser: true,
      completedGroup: false,
   },
   group: async ({ options }, use) => {
      await clearAuthData()
      await clearFirestoreData()

      let group: Group
      if (options.completedGroup === true) {
         const completeCompanyData = GroupSeed.generateCompleteCompanyData()
         group = await GroupSeed.createGroup(completeCompanyData)
      } else {
         group = await GroupSeed.createGroup()
      }

      await use(group)
   },
   user: async ({ group, options }, use) => {
      if (options.createUser === true) {
         const user = await UserSeed.createUser(credentials.correctEmail)

         await GroupSeed.addGroupAdmin(
            user,
            group,
            "OWNER" as GROUP_DASHBOARD_ROLE
         )

         await use(user)
      }
   },
   interests: async ({}, use) => {
      const interests = await InterestSeed.createBasicInterests()
      await use(interests)
   },
   // user dependency required
   groupPage: async ({ page, user, group }, use) => {
      const groupPage = new GroupDashboardPage(page, group)
      await groupPage.setLocalStorageKeys()

      const newUrl = `/group/${group.id}/admin`
      await LoginPage.login(page, { waitForURL: newUrl })

      await use(groupPage)
   },
})
