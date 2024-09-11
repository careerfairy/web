import { Spark } from "@careerfairy/shared-lib/dist/sparks/sparks"
import * as cliProgress from "cli-progress"
import { BulkWriter } from "firebase-admin/firestore"
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
import { DataWithRef } from "../../../util/types"

async function getVideoDurationInSeconds(url: string) {
   /*
   * In order to avoid adding one more node module to the project,
   + instead I will leave the functions unimplemented and if ever needed just 
   * install get-video-duration:
   *  ● npm install --workspace @careerfairy/firebase-scripts get-video-duration
   */
   throw new Error("Not implemented. Trying to get video duration for " + url)
}

type SparkDataWithRef = DataWithRef<true, Spark>

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
      const allSparks = await logAction(
         () => groupRepo.getAllSparks(true),
         "Fetching all sparks..."
      )

      Counter.log(`Fetched ${allSparks?.length} sparks`)

      counter.addToReadCount(allSparks?.length ?? 0)

      const bulkWriter = firestore.bulkWriter()

      progressBar.start(allSparks.length, 0)

      await updateSparkVideoDuration(allSparks, counter, bulkWriter)

      await bulkWriter.close()
      progressBar.stop()

      Counter.log("Finished backfilling sparks video duration.")
   } catch (error) {
      console.log(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const updateSparkVideoDuration = async (
   sparks: SparkDataWithRef[],
   counter: Counter,
   bulkWriter: BulkWriter
) => {
   loopProgressBar.start(sparks.length, 0)

   let index = 0
   for (const spark of sparks) {
      if (spark.video.duration) {
         counter.writeIncrement()
         continue
      }

      try {
         const duration = await getVideoDurationInSeconds(spark.video.url)
         bulkWriter
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update(spark._ref as any, {
               video: {
                  ...spark.video,
                  duration,
               },
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
      } catch (error) {
         console.log(`\nCouldn't load video for spark ${spark.id}: ${error}`)
         continue
      }
   }
   loopProgressBar.stop()
}
