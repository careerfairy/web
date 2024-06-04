import { UserData } from "@careerfairy/shared-lib/src/users"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { userRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const RUNNING_VERSION = "0.1"
const counter = new Counter()

// types
type UserDataWithRef = DataWithRef<true, UserData>

const BUSINESS_FUNCTIONS_INTERESTS_MAPPINGS = {
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

const CONTENT_TOPICS_INTERESTS_MAPPINGS = {
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
      Counter.log(
         `Fetching data for Backfilling Users data - Category tagging - v${RUNNING_VERSION} `
      )

      const [allUsers] = await logAction(
         () => Promise.all([userRepo.getAllUsers(true)]),
         "Fetching all Users"
      )

      Counter.log(`Fetched ${allUsers.length} Users`)

      counter.addToReadCount(allUsers.length)

      // const usersDict: Record<string, UserData> =
      //    convertDocArrayToDict(allUsers)

      // cascade group metadata to Job Applications
      await cascadeUserInterestsToCategoryTags(allUsers)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeUserInterestsToCategoryTags = async (
   // usersDictionary: Record<string, UserData>
   users: UserDataWithRef[]
) => {
   console.log("🚀 ~ usersDictionary:", users)
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   // const userKeys = Object.keys(usersDictionary)
   const totalNumDocs = users.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const usersChunk = users.slice(i, i + batchSize) // Slice the data into batches

      usersChunk.forEach((user) => {
         writeProgressBar.increment() // Increment progress bar

         if (user.interestIds?.length) {
            user.businessFunctionsTagIds = mapUserInterestsToTagIds(
               (id) => BUSINESS_FUNCTIONS_INTERESTS_MAPPINGS[id],
               user.interestIds
            )
            user.contentTopicsTagIds = mapUserInterestsToTagIds(
               (id) => CONTENT_TOPICS_INTERESTS_MAPPINGS[id],
               user.interestIds
            )
         }

         if (user.languages) {
            user.languageTagIds = mapUserInterestsToTagIds(
               (id) => BUSINESS_FUNCTIONS_INTERESTS_MAPPINGS[id],
               user.interestIds
            )

            // businessFunctionsTagIds?: string[]
            // contentTopicsTagIds?: string[]
            // languageTagIds?: string[] // Based on userData spoken languages
         }
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Job Applications batches committed! :)")
}

function mapUserInterestsToTagIds(
   mapper: (id: string) => string[],
   interestIds?: string[]
): string[] {
   if (!interestIds?.length) {
      return []
   }

   return interestIds?.map(mapper).flat()
}
