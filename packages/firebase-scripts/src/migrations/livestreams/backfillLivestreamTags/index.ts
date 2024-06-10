import { LivestreamEvent } from "@careerfairy/shared-lib/src/livestreams"
import { uniq } from "lodash"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const counter = new Counter()

// types
type LivestreamDataWithRef = DataWithRef<true, LivestreamEvent>

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
      Counter.log(
         "Fetching data for Backfilling live streams data - Category tagging"
      )

      const [allEvents] = await logAction(
         () => Promise.all([livestreamRepo.getAllLivestreams(false, true)]),
         "Fetching all live streams"
      )

      Counter.log(`Fetched ${allEvents.length} live streams`)

      counter.addToReadCount(allEvents.length)

      await cascadeEventInterestsToCategoryTags(allEvents)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const cascadeEventInterestsToCategoryTags = async (
   events: LivestreamDataWithRef[]
) => {
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalNumDocs = events.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const eventsChunk = events.slice(i, i + batchSize) // Slice the data into batches

      eventsChunk.forEach((event: LivestreamDataWithRef) => {
         writeProgressBar.increment() // Increment progress bar

         const toUpdate: Pick<
            LivestreamEvent,
            "businessFunctionsTagIds" | "contentTopicsTagIds"
         > = {
            businessFunctionsTagIds: [],
            contentTopicsTagIds: [],
         }

         if (event.interestsIds?.length) {
            toUpdate.businessFunctionsTagIds = mapEventInterestsToTagIds(
               (id) => INTERESTS_IDS_BUSINESS_FUNCTIONS_TAGS_MAP[id],
               event.interestsIds
            )

            toUpdate.contentTopicsTagIds = mapEventInterestsToTagIds(
               (id) => INTERESTS_IDS_CONTENT_TOPICS_TAGS_MAP[id],
               event.interestsIds
            )
         }

         if (
            event.companyIndustries?.find(
               (industry) => "ManagementConsulting" === industry
            )
         ) {
            toUpdate.businessFunctionsTagIds.push("Consulting")
         }
         toUpdate.businessFunctionsTagIds = uniq(
            toUpdate.businessFunctionsTagIds
         )
         toUpdate.contentTopicsTagIds = uniq(toUpdate.contentTopicsTagIds)
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         batch.update(event._ref as any, toUpdate)
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Live stream tags back filled from interestsIds :)")
}

/**
 * There should be no need for removing duplicates as long as
 * the input of ids is without such also.
 */
function mapEventInterestsToTagIds(
   mapper: (id: string) => string[],
   interestIds?: string[]
): string[] {
   if (!interestIds?.length) {
      return []
   }

   return interestIds?.map(mapper).flat()
}
