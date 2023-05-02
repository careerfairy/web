import { expect, Locator, Page, test } from "@playwright/test"
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
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { sleep } from "../utils"

test.beforeEach(async () => {
   await clearAuthData()
   await clearFirestoreData()
})

test("successful registration on a livestream event", async ({ page }) => {
   const livestreamPage = new UpcomingLivestreamPage(page)
   const { livestream } = await setupData()

   await completeSuccessfulRegistration({
      page,
      livestreamPage,
      livestream,
   })
})

test("successful registration on a livestream event with no questions", async ({
   page,
}) => {
   const livestreamPage = new UpcomingLivestreamPage(page)
   const { livestream } = await setupData(undefined, {
      groupQuestionsMap: null,
   })

   await completeSuccessfulRegistration({
      page,
      livestreamPage,
      livestream,
   })
})

test("past event without login should request the user to login to access the recording", async ({
   page,
}) => {
   const livestreamPage = new UpcomingLivestreamPage(page)
   const { livestream } = await setupData({}, {}, "createPast")

   await livestreamPage.open(livestream.id)
   await expect(livestreamPage.buttonPastEventNoLogin.isVisible()).toBeTruthy()
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
   expect(finalLivestreamData.userLivestreamData[0].user.userEmail).toBe(
      user.userEmail
   )
   expect(
      finalLivestreamData.userLivestreamData[0].talentPool.date
   ).toBeTruthy()
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
   // page.locator = slowLocator(page, 1000)

   // TODO: remove this when Agora supports Webkit 16.x
   test.skip(
      browserName === "webkit",
      "Temporarily disabled on WebKit until Agora supports Webkit 16.x"
   )

   const livestreamPage = new UpcomingLivestreamPage(page)
   const { livestream } = await setupData({}, {}, "createLive")

   await login(page)

   // await page.pause()

   // open page
   await livestreamPage.open(livestream.id, true)
   await livestreamPage.selectRandomCategoriesFromEvent(livestream)
   await livestreamPage.enterEvent()

   // https://github.com/microsoft/playwright/issues/13640
   await sleep(3000)
   try {
      await page.reload({ waitUntil: "commit" })
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
      Object.assign({}, overrideGroupDetails)
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

// Return a "slow" page locator that waits before 'click' and 'fill' requests
function slowLocator(
   page: Page,
   waitInMs: number
): (...args: any[]) => Locator {
   // Grab original
   const l = page.locator.bind(page)

   // Return a new function that uses the original locator but remaps certain functions
   return (locatorArgs) => {
      const locator = l(locatorArgs)

      locator.click = async (args) => {
         await new Promise((r) => setTimeout(r, waitInMs))
         return l(locatorArgs).click(args)
      }

      locator.fill = async (args) => {
         await new Promise((r) => setTimeout(r, waitInMs))
         return l(locatorArgs).fill(args)
      }

      return locator
   }
}

const completeSuccessfulRegistration = async ({
   page,
   livestreamPage,
   livestream,
}: {
   page: Page
   livestreamPage: UpcomingLivestreamPage
   livestream: LivestreamEvent
}) => {
   const user: UserData = await login(page)

   // open page
   await livestreamPage.open(livestream.id)
   await expectExactText(page, livestream.title)

   // click to attend
   await livestreamPage.attend()

   // Registration Modal
   if (livestream.groupQuestionsMap) {
      await livestreamPage.selectRandomCategoriesFromEvent(livestream)
   }

   await livestreamPage.modalAttend()

   await expectText(page, "ASK YOUR QUESTION")

   await livestreamPage.skip()
   await expectExactText(page, `Join the ${livestream.company} Talent Pool`)

   await livestreamPage.resilientClick("text=Skip")
   await livestreamPage.finish()

   // redirect
   const expectedPath = "/next-livestreams"
   if (page.url().indexOf(expectedPath) === -1) {
      // wait for navigation if not there yet
      await page.waitForURL(`**${expectedPath}`, { timeout: 10000 })
   }

   await expectSelector(page, `h1:has-text("Live streams")`)
   await expectExactText(page, "Booked!")

   // confirm we can't register again
   await livestreamPage.open(livestream.id)
   await expect(await livestreamPage.buttonAlreadyBooked).toBeDisabled()

   // assert firestore data is right
   const finalLivestreamData = await LivestreamSeed.getWithSubcollections(
      livestream.id,
      ["userLivestreamData"]
   )
   expect(finalLivestreamData.userLivestreamData[0].user.userEmail).toBe(
      user.userEmail
   )
   expect(
      finalLivestreamData.userLivestreamData[0].registered.date
   ).toBeTruthy()
   expect(finalLivestreamData.livestream.registeredUsers).toContain(
      user.userEmail
   )
}
