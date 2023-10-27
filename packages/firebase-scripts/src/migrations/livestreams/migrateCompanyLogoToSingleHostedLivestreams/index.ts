import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   writeProgressBar,
} from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import counterConstants from "../../../lib/Counter/constants"

const counter = new Counter()

export async function run() {
   try {
      const [livestreams, groups] = await Promise.all([
         logAction(
            () => livestreamRepo.getAllLivestreams(false),
            "Fetching Livestreams..."
         ),
         logAction(() => groupRepo.getAllGroups(), "Fetching of groups..."),
      ])

      Counter.log(
         `Fetched ${livestreams?.length} live streams and ${groups?.length} groups`
      )

      counter.addToReadCount((livestreams?.length ?? 0) + (groups?.length ?? 0))

      const livestreamsWithSingleHost = livestreams?.filter(
         (livestream) => livestream.groupIds.length === 1
      )
      const singleHostsIds = livestreamsWithSingleHost.map(
         (livestream) => livestream.groupIds[0]
      )

      const isValidUrl = (url: string) => url && url.trim() !== ""

      const logosById = groups
         .filter((group) => singleHostsIds.includes(group.id))
         .filter((group) => isValidUrl(group.logo?.url || group.logoUrl))
         .reduce((acc, group) => {
            acc[group.id] = group.logo?.url || group.logoUrl
            return acc
         }, {})

      const bulkWriter = firestore.bulkWriter()

      writeProgressBar.start(livestreamsWithSingleHost.length, 0)

      livestreamsWithSingleHost.forEach((livestream) => {
         const updatedLogoUrl = logosById[livestream.groupIds[0]]

         const livestreamRef = firestore
            .collection("livestreams")
            .doc(livestream.id)

         bulkWriter
            .update(livestreamRef, { companyLogoUrl: updatedLogoUrl })
            .then(() => handleBulkWriterSuccess(counter))
            .catch((e) => handleBulkWriterError(e, counter))

         counter.writeIncrement()
         counter.customCountIncrement(counterConstants.numSuccessfulWrites)
         writeProgressBar.increment()
      })

      await bulkWriter.close()
      writeProgressBar.stop()

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
