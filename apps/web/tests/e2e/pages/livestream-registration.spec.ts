import { test, expect, Page } from "@playwright/test"
import UserSeed from "@careerfairy/seed-data/dist/users"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import LivestreamSeed, {
   createLivestreamGroupQuestions,
} from "@careerfairy/seed-data/dist/livestreams"
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
import { Group } from "@careerfairy/shared-lib/dist/groups"
import {
   LivestreamEvent,
   LivestreamUserAction,
} from "@careerfairy/shared-lib/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { sleep } from "../utils"

test.beforeEach(async () => {
   await clearAuthData()
   await clearFirestoreData()
})

test("successful registration on a livestream event", async ({ page }) => {
   const livestreamPage = new UpcomingLivestreamPage(page)
   const { group, livestream } = await setupData()

   const user: UserData = await login(page)

   // open page
   await livestreamPage.open(livestream.id)
   await expectExactText(page, livestream.title)

   // click to attend
   await livestreamPage.attend()

   // Registration Modal
   await livestreamPage.selectRandomCategoriesFromEvent(livestream)
   await livestreamPage.modalAttend()

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

   // confirm we can't register again
   await livestreamPage.open(livestream.id)
   await expect(await livestreamPage.buttonAlreadyBooked).toBeDisabled()

   // assert firestore data is right
   const finalLivestreamData = await LivestreamSeed.getWithSubcollections(
      livestream.id,
      ["userLivestreamData"]
   )
   expect(finalLivestreamData.userLivestreamData[0].userEmail).toBe(
      user.userEmail
   )
   expect(finalLivestreamData.userLivestreamData[0].userHas).toContain(
      "registeredToLivestream" as LivestreamUserAction
   )
   expect(finalLivestreamData.livestream.registeredUsers).toContain(
      user.userEmail
   )
})

test("past event shouldn't be able to register", async ({ page }) => {
   const livestreamPage = new UpcomingLivestreamPage(page)
   const { livestream } = await setupData({}, {}, "createPast")

   await livestreamPage.open(livestream.id)
   await expect(await livestreamPage.buttonEventOver).toBeDisabled()
})

test("register to an event and fill out a question and join talent pool", async ({
   page,
}) => {
   const livestreamPage = new UpcomingLivestreamPage(page)
   const { livestream } = await setupData({}, { groupQuestionsMap: null })

   const user = await login(page)

   // open page
   await livestreamPage.open(livestream.id)

   // click to attend
   await livestreamPage.attend()

   // Registration Modal
   await livestreamPage.modalAttend()

   const question = "My useful question with 10 chars"
   await livestreamPage.fillQuestion(question)

   await livestreamPage.modalSubmit()
   await livestreamPage.joinTalentPool()

   await livestreamPage.finish()

   // assert firestore data is right
   const finalLivestreamData = await LivestreamSeed.getWithSubcollections(
      livestream.id,
      ["questions", "userLivestreamData"]
   )
   expect(finalLivestreamData.questions[0].title).toBe(question)
   expect(finalLivestreamData.userLivestreamData[0].userEmail).toBe(
      user.userEmail
   )
   expect(finalLivestreamData.userLivestreamData[0].userHas).toContain(
      "joinedTalentPool" as LivestreamUserAction
   )
})

test("register to an event without login, login and proceed with registration", async ({
   page,
}) => {
   const livestreamPage = new UpcomingLivestreamPage(page)
   const { group, livestream } = await setupData()

   // open page
   await livestreamPage.open(livestream.id)

   await livestreamPage.attend()

   // redirection to login
   await page.waitForURL(`**/login?absolutePath**`)
   await login(page, true)

   // confirm the registration modal is open
   await page.waitForURL(`**/upcoming-livestream/**`)
   await expectExactText(
      page,
      `${livestream.company} Would Like To Know More About You`
   )
   await expectExactText(page, group.description)
   await livestreamPage.cancel()

   await expectExactText(page, livestream.title)
})

test("livestream has already started, confirm the redirection without any registration", async ({
   page,
   browserName,
}) => {
   const livestreamPage = new UpcomingLivestreamPage(page)
   const { livestream } = await setupData({}, {}, "createLive")

   await login(page)

   // open page
   await livestreamPage.open(livestream.id)
   await livestreamPage.selectRandomCategoriesFromEvent(livestream)
   await livestreamPage.enterEvent()

   // https://github.com/microsoft/playwright/issues/13640
   await sleep(500)
   try {
      await page.reload()
   } catch (e) {
      // ignore this test if it fails for webkit, the page seems to crash for some reason
      test.skip(browserName === "webkit", "Page crashed on reload")
   }

   // assert we're on the streaming page
   expect(page.url()).toContain(`/streaming/${livestream.id}/viewer`)
   await expectExactText(page, "Add a Question")
})

/*
|--------------------------------------------------------------------------
| Setup Data
|--------------------------------------------------------------------------
*/
const userEmail = "john.doe@careerfairy.io"

async function login(
   page: Page,
   preventRedirection = false
): Promise<UserData> {
   const user = await UserSeed.createUser(userEmail)

   if (!preventRedirection) {
      await page.goto("/login")
   }

   await page.fill('input[name="email"]', user.userEmail)
   await page.fill('input[name="password"]', "password")

   await Promise.all([page.click("text=Log in"), page.waitForNavigation()])

   if (!preventRedirection) {
      await page.waitForURL("/portal")
   }

   return user
}

async function setupData(
   overrideGroupDetails: Partial<Group> = {},
   overrideLivestreamDetails: Partial<LivestreamEvent> = {},
   livestreamType: "create" | "createPast" | "createLive" = "create"
) {
   const group = await GroupSeed.createGroup(
      Object.assign(
         {
            adminEmails: [userEmail],
         },
         overrideGroupDetails
      )
   )

   const groupQuestions = createLivestreamGroupQuestions(group.id)

   const livestream = await LivestreamSeed[livestreamType](
      Object.assign(
         {
            groupIds: [group.id],
            groupQuestionsMap: {
               [group.id]: groupQuestions,
            },
         },
         overrideLivestreamDetails
      )
   )

   return { group, livestream }
}
