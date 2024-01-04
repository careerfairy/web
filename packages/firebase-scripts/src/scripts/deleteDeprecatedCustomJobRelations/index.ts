import { firestore } from "../../lib/firebase"
import { getCLIBarOptions } from "../../util/misc"
import Counter from "../../lib/Counter"
import { logAction } from "../../util/logger"
import * as cliProgress from "cli-progress"
import { FieldValue } from "firebase-admin/firestore"

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
         groupCustomJobsQuery,
         userJobApplicationsQuery,
         livestreamsQuery,
         draftLivestreamsQuery,
      ] = await logAction(
         () =>
            Promise.all([
               firestore.collectionGroup("customJobs").get(),
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
         `Start deleting ${groupCustomJobsQuery?.docs?.length} customJobs sucCollection documents`
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

      const totalDocsToDelete = [
         ...(groupCustomJobsQuery?.docs || []),
         ...(userJobApplicationsQuery?.docs || []),
      ]

      const totalDocsToRemoveField = [
         ...(livestreamsQuery?.docs || []),
         ...(draftLivestreamsQuery?.docs || []),
      ]

      counter.addToReadCount(
         totalDocsToDelete.length + totalDocsToRemoveField.length
      )

      jobProgressBar.start(
         totalDocsToDelete.length + totalDocsToRemoveField.length,
         0
      )

      totalDocsToDelete.forEach((doc) => {
         bulkWriter.delete(doc.ref)

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
