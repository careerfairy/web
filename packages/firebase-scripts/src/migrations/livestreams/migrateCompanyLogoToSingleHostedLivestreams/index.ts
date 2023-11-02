import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
} from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import * as cliProgress from "cli-progress"
import { BulkWriter } from "firebase-admin/firestore"

const WRITE_BATCH = 50
const counter = new Counter()
const progressBar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing groups batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

export async function run() {
   try {
      const [livestreams, groups] = await Promise.all([
         logAction(
            () => livestreamRepo.getAllLivestreams(false, true),
            "Fetching live streams..."
         ),
         logAction(() => groupRepo.getAllGroups(), "Fetching groups..."),
      ])

      Counter.log(
         `Fetched ${livestreams?.length} live streams and ${groups?.length} groups`
      )

      counter.addToReadCount((livestreams?.length ?? 0) + (groups?.length ?? 0))

      const livestreamsWithSingleHost = livestreams?.filter(
         (livestream) => livestream.groupIds?.length === 1
      )
      const singleHostsIds = livestreamsWithSingleHost.map(
         (livestream) => livestream.groupIds[0]
      )

      const logosById = groups
         .filter((group) => singleHostsIds.includes(group.groupId))
         .reduce((acc, group) => {
            acc[group.groupId] = group.logo?.url || group.logoUrl
            return acc
         }, {})

      const bulkWriter = firestore.bulkWriter()

      progressBar.start(livestreamsWithSingleHost.length, 0)

      await migrateLogos(
         livestreamsWithSingleHost,
         logosById,
         counter,
         bulkWriter
      )

      await bulkWriter.close()
      progressBar.stop()

      Counter.log(
         "Finished migrating company logos to singly-hosted live streams."
      )
   } catch (error) {
      console.log(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const migrateLogos = async (
   livestreamsWithSingleHost,
   logosById,
   counter: Counter,
   bulkWriter: BulkWriter
) => {
   loopProgressBar.start(livestreamsWithSingleHost.length, 0)

   let index = 0
   for (const livestream of livestreamsWithSingleHost) {
      const updatedLogoUrl = logosById[livestream.groupIds[0]]

      if (updatedLogoUrl) {
         bulkWriter
            .update(livestream._ref, { companyLogoUrl: updatedLogoUrl })
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
      } else {
         counter.customCountIncrement("Missing logo URL.")
      }
   }
   loopProgressBar.stop()
}
