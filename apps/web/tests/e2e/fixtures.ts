import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/emulators"
import { Group, GROUP_DASHBOARD_ROLE } from "@careerfairy/shared-lib/groups"
import { UserData } from "@careerfairy/shared-lib/users"
import { credentials } from "../constants"
import { GroupDashboardPage } from "./page-object-models/GroupDashboardPage"
import { LoginPage } from "./page-object-models/LoginPage"
import { test as base } from "@playwright/test"
import GroupSeed from "@careerfairy/seed-data/groups"
import UserSeed from "@careerfairy/seed-data/users"
import InterestSeed from "@careerfairy/seed-data/interests"
import { Interest } from "@careerfairy/shared-lib/interests"

type GroupAdminFixtureOptions = {
   /**
    * give the option for tests to not create a user
    */
   createUser?: boolean
   /**
    * give the option to create a complete group
    */
   completedGroup?: boolean
   /**
    * Sets up the ATS integration for the group
    * - "COMPLETE" - creates a completly snyced ATS group with the application test already done
    * - "NEEDS_APPLICATION_TEST" - creates an ATS group that needs a candidate application test
    *
    * */
   atsGroupType?: "COMPLETE" | "NEEDS_APPLICATION_TEST" | "NONE"
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
      atsGroupType: "NONE",
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

      switch (options.atsGroupType) {
         case "COMPLETE":
            await GroupSeed.setupATSForGroup(group)
            break
         case "NEEDS_APPLICATION_TEST":
            await GroupSeed.setupATSForGroup(group, {
               needsApplicationTest: true,
            })
            break
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

/**
 * Signed In Test Fixture
 *
 * Creates a user and signs in the user
 * After login, the user should be on the /portal page
 */
export const signedInFixture = base.extend<{
   user: UserData
}>({
   user: async ({ page }, use) => {
      await clearAuthData()
      await clearFirestoreData()

      const userData = await UserSeed.createUser(credentials.correctEmail)

      await LoginPage.login(page)

      await use(userData)
   },
})
