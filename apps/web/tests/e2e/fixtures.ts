import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/emulators"
import FieldOfStudySeed from "@careerfairy/seed-data/fieldsOfStudy"
import GroupSeed from "@careerfairy/seed-data/groups"
import JobsSeed from "@careerfairy/seed-data/jobs"
import UserSeed from "@careerfairy/seed-data/users"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { GROUP_DASHBOARD_ROLE, Group } from "@careerfairy/shared-lib/groups"
import { Interest } from "@careerfairy/shared-lib/interests"
import { UserData } from "@careerfairy/shared-lib/users"
import { test as base } from "@playwright/test"
import { loadTestEnv } from "envConfig"
import { credentials } from "../constants"
import { GroupDashboardPage } from "./page-object-models/GroupDashboardPage"
import { LoginPage } from "./page-object-models/LoginPage"

type OfflineEventStatus =
   | "first-timer" // Never purchased offline events, shows promotion page
   | "out-of-events" // Previously purchased but no credits left, shows table
   | "has-available-events" // Has available offline event credits

export type GroupAdminFixtureOptions = {
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

   /**
    * Whether or not to set the privacy policy for the group
    */
   privacyPolicy?: boolean

   /**
    * Offline events status for the group
    * - "first-timer": Never purchased offline events, shows promotion page
    * - "out-of-events": Previously purchased but no credits left, shows table
    * - "has-available-events": Has available offline event credits
    */
   offlineEventStatus?: OfflineEventStatus
}

base.beforeEach(async () => {
   loadTestEnv()
})

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
   levelOfStudyIds: FieldOfStudy[]
   fieldOfStudyIds: FieldOfStudy[]
   customJobs: CustomJob[]
}>({
   options: {
      createUser: true,
      completedGroup: false,
      atsGroupType: "NONE",
      privacyPolicy: false,
      offlineEventStatus: "first-timer",
   },
   group: async ({ options }, use) => {
      await clearAuthData()
      await clearFirestoreData()

      const overrideFields: Partial<Group> = {}

      if (options.privacyPolicy === true) {
         overrideFields.privacyPolicyActive = true
         overrideFields.privacyPolicyUrl = "https://careerfairy.io"
      }

      if (!options.atsGroupType || options.atsGroupType === "NONE")
         overrideFields.atsAdminPageFlag = false

      // Set offline events options based on status
      if (options.offlineEventStatus) {
         switch (options.offlineEventStatus) {
            case "first-timer":
               // Never purchased offline events, shows promotion page
               overrideFields.hasPurchasedOfflineEvents = false
               overrideFields.availableOfflineEvents = 0
               break
            case "out-of-events":
               // Previously purchased but no credits left, shows table
               overrideFields.hasPurchasedOfflineEvents = true
               overrideFields.availableOfflineEvents = 0
               break
            case "has-available-events":
               // Has available offline event credits
               overrideFields.hasPurchasedOfflineEvents = true
               overrideFields.availableOfflineEvents = 5
               break
         }
      }

      let group: Group

      if (options.completedGroup === true) {
         const completeCompanyData = GroupSeed.generateCompleteCompanyData()
         group = await GroupSeed.createGroup({
            ...overrideFields,
            ...completeCompanyData,
         })
      } else {
         group = await GroupSeed.createGroup(overrideFields)
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

      await JobsSeed.createCustomJobs(group.groupId, [])

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
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   customJobs: async ({ group }, use) => {
      const customJobs = await JobsSeed.getCustomJobs(group.groupId)
      await use(customJobs)
   },
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   levelOfStudyIds: async ({ options }, use) => {
      const levelOfStudies = await FieldOfStudySeed.getDummyLevelsOfStudy()
      await use(levelOfStudies)
   },

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   fieldOfStudyIds: async ({ options }, use) => {
      const fieldOfStudies = await FieldOfStudySeed.getDummyFieldsOfStudy()
      await use(fieldOfStudies)
   },
   // user dependency required
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
