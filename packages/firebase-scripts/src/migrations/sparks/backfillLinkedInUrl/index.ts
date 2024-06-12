import { Creator } from "@careerfairy/shared-lib/src/groups/creators"
import * as cliProgress from "cli-progress"
import { BulkWriter, Timestamp } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
} from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"

const WRITE_BATCH = 50
const counter = new Counter()
const progressBar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

// eslint-disable-next-line
export async function run() {
   try {
      const [allSparks, allCreators] = await Promise.all([
         logAction(
            () => groupRepo.getAllSparks(true),
            "Fetching all sparks..."
         ),
         logAction(
            () => groupRepo.getAllCreators(true),
            "Fetching all creators..."
         ),
      ])

      Counter.log(
         `Fetched ${allSparks?.length} sparks and ${allCreators?.length} creators`
      )

      counter.addToReadCount(
         (allSparks?.length ?? 0) + (allCreators?.length ?? 0)
      )

      const creatorsWithLinkedInUrl = allCreators?.filter(
         (creator) => creator.linkedInUrl && creator.linkedInUrl !== ""
      )

      const creatorsMap = new Map<string, Creator>()
      creatorsWithLinkedInUrl.forEach((creator) => {
         creatorsMap.set(creator.id, creator)
      })

      const sparksWithoutLinkedInUrl = allSparks
         ?.filter(
            (spark) =>
               spark.creator.linkedInUrl === "" || !spark.creator.linkedInUrl
         )
         .filter((spark) => creatorsMap.has(spark.creator.id))

      const bulkWriter = firestore.bulkWriter()

      progressBar.start(allSparks.length, 0)

      await backfillLinkedInUrl(
         sparksWithoutLinkedInUrl,
         creatorsMap,
         counter,
         bulkWriter
      )

      await bulkWriter.close()
      progressBar.stop()

      Counter.log("Finished backfilling live stream creators.")
   } catch (error) {
      console.log(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const backfillLinkedInUrl = async (
   sparksWithoutLinkedInUrl,
   creatorsMap: Map<string, Creator>,
   counter: Counter,
   bulkWriter: BulkWriter
) => {
   loopProgressBar.start(sparksWithoutLinkedInUrl.length, 0)

   let index = 0
   for (const spark of sparksWithoutLinkedInUrl) {
      const creator = creatorsMap.get(spark.creator.id)

      if (!creator) {
         console.log(`Creator ${spark.creator.id} not found`)
         continue
      }

      if (!creator.linkedInUrl || creator.linkedInUrl === "") {
         console.log(`Creator ${spark.creator.id} has no linkedInUrl`)
         continue
      }

      console.log(spark.id)

      bulkWriter
         .update(spark._ref, {
            creator: {
               ...spark.creator,
               linkedInUrl: creatorsMap.get(spark.creator.id).linkedInUrl,
            },
            lastModifiedByScript: Timestamp.fromMillis(Date.now()),
         })
         .then(() => handleBulkWriterSuccess(counter))
         .catch((error) => {
            console.log(error)
            handleBulkWriterError(error, counter)
         })

      counter.writeIncrement()
      loopProgressBar.update(index + 1)

      if (index % WRITE_BATCH === 0) {
         await bulkWriter.flush()
      }

      index++
   }
   loopProgressBar.stop()
}
