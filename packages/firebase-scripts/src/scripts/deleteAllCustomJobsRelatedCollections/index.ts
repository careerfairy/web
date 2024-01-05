import { firestore } from "../../lib/firebase"
import { getCLIBarOptions } from "../../util/misc"
import Counter from "../../lib/Counter"
import { logAction } from "../../util/logger"
import * as cliProgress from "cli-progress"

const counter = new Counter()

const jobProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions(
      "Deleting all Custom Jobs related collections",
      "All Custom Jobs related collections deleted"
   ),
   cliProgress.Presets.shades_classic
)

export async function run() {
   console.log("start deleting all customJob related collections")
   const bulkWriter = firestore.bulkWriter()

   try {
      const [customJobsQuery, jobApplicationsQuery, jobStatsQuery] =
         await logAction(
            () =>
               Promise.all([
                  firestore.collection("customJobs").get(),
                  firestore.collection("customJobStats").get(),
                  firestore.collection("jobApplications").get(),
               ]),
            "Fetching custom jobs, job applications and job stats collections"
         )

      console.log(`Start deleting ${customJobsQuery?.docs?.length} custom jobs`)
      console.log(
         `Start deleting ${jobApplicationsQuery?.docs?.length} job applications`
      )
      console.log(`Start deleting ${jobStatsQuery?.docs?.length} job stats`)

      const totalDocs = [
         ...(customJobsQuery?.docs || []),
         ...(jobApplicationsQuery?.docs || []),
         ...(jobStatsQuery?.docs || []),
      ]

      counter.addToReadCount(totalDocs.length)

      jobProgressBar.start(totalDocs.length, 0)

      totalDocs.forEach((doc) => {
         bulkWriter.delete(doc.ref)

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
