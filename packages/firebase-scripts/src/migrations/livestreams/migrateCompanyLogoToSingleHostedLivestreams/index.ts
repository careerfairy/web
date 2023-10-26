import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"

const counter = new Counter()

export async function run() {
   try {
      const livestreams = await logAction(
         () => livestreamRepo.getAllLivestreams(false),
         "Fetching Livestreams"
      )
      const livestreamsWithSingleHost = livestreams?.filter(
         (livestream) => livestream.groupIds.length === 1
      )
      const singleHostsIds = livestreamsWithSingleHost.map(
         (livestream) => livestream.groupIds[0]
      )

      const singleHosts = await logAction(
         () => groupRepo.getGroupsByIds(singleHostsIds),
         "Fetching subset of groups"
      )

      Counter.log(
         `Fetched ${livestreams?.length} live streams and ${singleHosts?.length} groups`
      )
      counter.addToReadCount(
         (livestreams?.length ?? 0) + (singleHosts?.length ?? 0)
      )

      const logosById = singleHosts?.reduce((acc, host) => {
         acc[host.id] = host.logoUrl || host.logo.url
         return acc
      }, {})

      const batch = firestore.batch()
      writeProgressBar.start(livestreamsWithSingleHost.length, 0)

      livestreamsWithSingleHost.forEach((livestream) => {
         const updatedLogoUrl = logosById[livestream.groupIds[0]]
         if (updatedLogoUrl) {
            const livestreamRef = firestore
               .collection("livestreams")
               .doc(livestream.id)
            batch.update(livestreamRef, { companyLogoUrl: updatedLogoUrl })
            counter.writeIncrement()
            writeProgressBar.increment()
         }
      })

      await batch.commit()

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
