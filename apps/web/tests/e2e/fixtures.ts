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
import {
   GroupOption,
   GroupPhoto,
   GroupVideo,
   Testimonial,
} from "@careerfairy/shared-lib/dist/groups"
import { faker } from "@faker-js/faker"

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

      const overrideFields: Partial<Group> = {
         extraInfo: "extra info extra info",
         companyCountry: { name: "portugal" } as GroupOption,
         companyIndustries: [{ name: "accounting" }] as GroupOption[],
         companySize: "1-20",
         photos: [
            {
               id: faker.company.bs(),
               url: faker.image.imageUrl(),
            },
            {
               id: faker.company.bs(),
               url: faker.image.imageUrl(),
            },
            {
               id: faker.company.bs(),
               url: faker.image.imageUrl(),
            },
         ] as GroupPhoto[],
         videos: [
            {
               url: faker.image.imageUrl(),
               title: faker.company.bs(),
               description: faker.company.bs(),
               isEmbedded: true,
            },
         ] as GroupVideo[],
         testimonials: [
            {
               id: faker.company.bs(),
               name: faker.company.companyName(),
               position: faker.company.bs(),
               testimonial: faker.company.bs(),
               avatar: faker.image.imageUrl(),
               groupId: faker.company.bs(),
            },
         ] as Testimonial[],
      }

      const group = options.completedGroup
         ? await GroupSeed.createGroup(overrideFields)
         : await GroupSeed.createGroup()

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
