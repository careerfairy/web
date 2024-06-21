import { UserData } from "@careerfairy/shared-lib/src/users"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { userRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const counter = new Counter()

// types
type UserDataWithRef = DataWithRef<true, UserData>

const INTERESTS_IDS_BUSINESS_FUNCTIONS_TAGS_MAP = {
   Le9yVcgRtkReAdwyh6tq: [], // Startups,
   MPY3KTjYH1GiePa4I0kZ: ["ResearchDevelopment"], // Research & Development,
   OjIkyLu7oxICHqweTT04: ["BusinessDevelopment"], // Business,
   ZXvJo51KI8HHXbUiC7Jl: [], // Resume & Cover Letter,
   bcs4xerUoed6G28AVjSZ: ["Marketing"], // Marketing,
   njgCUBkijDTSlKtAkAYx: [], // Large Companies,
   pyfkBYzhJ3ewnmGAoz1l: [], // Career Development,
   wMn0IAckmeK7bNSads0V: [], // Interview Preparation,
   yl0wwi5wQ6oHEt8ovoRb: [], // Public Sector
   zzBbeQvTajFdx10kz6X0: ["ProductManagement"], // Product Management
}

const INTERESTS_IDS_CONTENT_TOPICS_TAGS_MAP = {
   Le9yVcgRtkReAdwyh6tq: [], // Startups,
   MPY3KTjYH1GiePa4I0kZ: [], // Research & Development,
   OjIkyLu7oxICHqweTT04: [], // Business,
   ZXvJo51KI8HHXbUiC7Jl: ["ApplicationProcess"], // Resume & Cover Letter,
   bcs4xerUoed6G28AVjSZ: [], // Marketing,
   njgCUBkijDTSlKtAkAYx: [], // Large Companies,
   pyfkBYzhJ3ewnmGAoz1l: ["Role"], // Career Development,
   wMn0IAckmeK7bNSads0V: ["ApplicationProcess"], // Interview Preparation,
   yl0wwi5wQ6oHEt8ovoRb: [], // Public Sector
   zzBbeQvTajFdx10kz6X0: [], // Product Management
}

export async function run() {
   try {
      Counter.log("Fetching data for Backfilling Users data - Category tagging")

      const [allUsers] = await logAction(
         () => Promise.all([userRepo.getAllUsers(true)]),
         "Fetching all Users"
      )

      Counter.log(`Fetched ${allUsers.length} Users`)

      counter.addToReadCount(allUsers.length)

      await cascadeUserInterestsToCategoryTags(allUsers)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeUserInterestsToCategoryTags = async (users: UserDataWithRef[]) => {
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalNumDocs = users.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const usersChunk = users.slice(i, i + batchSize) // Slice the data into batches

      usersChunk.forEach((user) => {
         writeProgressBar.increment() // Increment progress bar

         const toUpdate: Pick<
            UserData,
            "businessFunctionsTagIds" | "contentTopicsTagIds"
         > = {
            businessFunctionsTagIds: [],
            contentTopicsTagIds: [],
         }

         if (user.interestsIds?.length) {
            toUpdate.businessFunctionsTagIds = mapUserInterestsToTagIds(
               (id) => INTERESTS_IDS_BUSINESS_FUNCTIONS_TAGS_MAP[id],
               user.interestsIds
            )
            toUpdate.contentTopicsTagIds = mapUserInterestsToTagIds(
               (id) => INTERESTS_IDS_CONTENT_TOPICS_TAGS_MAP[id],
               user.interestsIds
            )
         }
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         batch.update(user._ref as any, toUpdate)
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Users tags back filled from interestsIds :)")
}

/**
 * There should be no need for removing duplicates as long as
 * the input of ids is without such also.
 */
function mapUserInterestsToTagIds(
   mapper: (id: string) => string[],
   interestIds?: string[]
): string[] {
   if (!interestIds?.length) {
      return []
   }

   return interestIds?.map(mapper).flat()
}
