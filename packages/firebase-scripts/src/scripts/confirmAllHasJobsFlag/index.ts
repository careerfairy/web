import { CustomJob } from "@careerfairy/shared-lib/dist/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import * as cliProgress from "cli-progress"
import Counter from "../../lib/Counter"
import { firestore } from "../../lib/firebase"
import { customJobRepo, livestreamRepo } from "../../repositories"
import { logAction } from "../../util/logger"
import { getCLIBarOptions } from "../../util/misc"
import { DataWithRef } from "../../util/types"

const counter = new Counter()
type LivestreamEventWithRef = DataWithRef<true, LivestreamEvent>

const liveStreamProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions(
      "Confirming all live streams hasJob flag",
      "All live streams hasJob flag confirmed"
   ),
   cliProgress.Presets.shades_classic
)

export async function run() {
   console.log("start confirming all live streams hasJob flag")
   const bulkWriter = firestore.bulkWriter()

   try {
      const [allLiveStreamsWithJobs, allCustomJobs] = await logAction(
         () =>
            Promise.all([
               livestreamRepo.getAllLivestreamsWithJobs(true),
               customJobRepo.getAllCustomJobs(),
            ]),
         "Fetching all custom jobs and live streams that have jobs"
      )

      console.log(
         `Start confirming ${allLiveStreamsWithJobs?.length} live stream documents`
      )

      // Filter live streams that do not have any associated custom jobs and have no Ats jobs listed
      const liveStreamsToTurnFlagToFalse: LivestreamEventWithRef[] =
         allLiveStreamsWithJobs
            .filter((event: LivestreamEvent) => {
               return !allCustomJobs.some((customJob: CustomJob) => {
                  return customJob.livestreams.some(
                     (livestreamId) => livestreamId === event.id
                  )
               })
            })
            .filter(
               (event: LivestreamEvent) =>
                  !event.jobs || event.jobs.length === 0
            )

      console.log(
         `Start updating ${liveStreamsToTurnFlagToFalse?.length} live stream documents`
      )

      counter.addToReadCount(liveStreamsToTurnFlagToFalse?.length)

      liveStreamProgressBar.start(liveStreamsToTurnFlagToFalse?.length, 0)

      liveStreamsToTurnFlagToFalse.forEach(({ _ref }) => {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         bulkWriter.update(_ref as any, {
            hasJobs: false,
         })

         counter.writeIncrement()
         liveStreamProgressBar.increment()
      })

      liveStreamProgressBar.stop()
      await logAction(() => bulkWriter.close(), "Closing BulkWriter")
   } catch (error) {
      console.error(error)
   } finally {
      counter.print()
   }
}
