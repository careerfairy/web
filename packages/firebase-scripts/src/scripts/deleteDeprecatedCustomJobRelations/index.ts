import { firestore } from "../../lib/firebase"
import { getCLIBarOptions } from "../../util/misc"
import Counter from "../../lib/Counter"
import { logAction } from "../../util/logger"
import * as cliProgress from "cli-progress"
import { FieldValue } from "firebase-admin/firestore"
import { groupRepo } from "../../repositories"

const counter = new Counter()

const jobProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions(
      "Deleting all Custom Jobs deprecated relations",
      "All Custom Jobs deprecated relations deleted"
   ),
   cliProgress.Presets.shades_classic
)

export async function run() {
   console.log("start deleting all customJob deprecated relations")
   const bulkWriter = firestore.bulkWriter()

   try {
      const [
         allLegacyCustomJobsQuery,
         userJobApplicationsQuery,
         livestreamsQuery,
         draftLivestreamsQuery,
      ] = await logAction(
         () =>
            Promise.all([
               groupRepo.getAllLegacyGroupCustomJobs(),
               firestore.collectionGroup("customJobApplications").get(),
               firestore.collection("livestreams").orderBy("customJobs").get(),
               firestore
                  .collection("draftLivestreams")
                  .orderBy("customJobs")
                  .get(),
            ]),
         "Fetching custom jobs and job applications collection groups and all livestream/drafts documents"
      )

      console.log(
         `Start deleting ${allLegacyCustomJobsQuery?.length} customJobs sucCollection documents`
      )
      console.log(
         `Start deleting ${userJobApplicationsQuery?.docs?.length} userJobApplications subCollection documents`
      )
      console.log(
         `Start deleting ${livestreamsQuery?.docs?.length} livestream customJobs field`
      )
      console.log(
         `Start deleting ${draftLivestreamsQuery?.docs?.length} draft livestreams customJobs field`
      )

      const totalDocRefsToDelete = [
         ...(allLegacyCustomJobsQuery?.map((d) => d._ref) || []),
         ...(userJobApplicationsQuery?.docs.map((d) => d.ref) || []),
      ]

      const totalDocsToRemoveField = [
         ...(livestreamsQuery?.docs || []),
         ...(draftLivestreamsQuery?.docs || []),
      ]

      counter.addToReadCount(
         totalDocRefsToDelete.length + totalDocsToRemoveField.length
      )

      jobProgressBar.start(
         totalDocRefsToDelete.length + totalDocsToRemoveField.length,
         0
      )

      totalDocRefsToDelete.forEach((ref) => {
         bulkWriter.delete(ref as any)

         counter.writeIncrement()
         jobProgressBar.increment()
      })

      totalDocsToRemoveField.forEach((doc) => {
         bulkWriter.update(doc.ref, {
            customJobs: FieldValue.delete(),
         })

         counter.writeIncrement()
         jobProgressBar.increment()
      })

      jobProgressBar.stop()
      await logAction(() => bulkWriter.close(), "Closing BulkWriter")
   } catch (error) {
      console.error(error)
   } finally {
      counter.print()
   }
}
