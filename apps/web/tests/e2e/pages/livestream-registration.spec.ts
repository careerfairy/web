import { test, expect } from "@playwright/test"
import UserSeed from "@careerfairy/seed-data/dist/users"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import LivestreamSeed from "@careerfairy/seed-data/dist/livestreams"
import {
   clearAuthData,
   clearFirestoreData,
} from "@careerfairy/seed-data/dist/emulators"
import UpcomingLivestreamPage from "../page-object-models/UpcomingLivestreamPage"
import {
   expectExactText,
   expectSelector,
   expectText,
} from "../utils/assertions"

test.beforeEach(async () => {
   await clearAuthData()
   await clearFirestoreData()
})

test("livestream page", async ({ page }) => {
   const livestreamPage = new UpcomingLivestreamPage(page)
   const { group, livestream } = await setupData()

   await login(page)

   // open page
   await livestreamPage.open(livestream.id)
   await livestreamPage.acceptCookies()
   await expectExactText(page, livestream.title)

   // click to attend
   await livestreamPage.attend()

   // Registration Modal
   await livestreamPage.selectRandomCategoriesFromGroup(group)
   await livestreamPage.submitCategories()

   await expectText(page, "ASK YOUR QUESTION")

   await livestreamPage.skip()
   await expectExactText(page, `Join the ${livestream.company} Talent Pool`)

   await livestreamPage.skip()
   await livestreamPage.finish()

   // redirect
   await page.waitForURL(
      `**/next-livestreams/${group.id}?livestreamId=${livestream.id}`
   )

   await expectSelector(page, `h3:has-text("${group.universityName}")`)
   await expectExactText(page, group.description)
   await expectExactText(page, "Booked!")
})

const userEmail = "carlos@careerfairy.io"

async function login(page) {
   const user = await UserSeed.createUser(userEmail)

   await page.goto("/login")
   await page.fill('input[name="email"]', user.userEmail)
   await page.fill('input[name="password"]', "password")
   await page.click("text=Log in")
   await page.waitForURL("/portal")
}

async function setupData(
   overrideGroupDetails = {},
   overrideLivestreamDetails = {}
) {
   const group = await GroupSeed.createGroup(
      Object.assign(
         {
            adminEmails: [userEmail],
         },
         overrideGroupDetails
      )
   )

   const livestream = await LivestreamSeed.createLivestream(
      Object.assign(
         {
            groupIds: [group.id],
         },
         overrideLivestreamDetails
      )
   )

   return { group, livestream }
}
