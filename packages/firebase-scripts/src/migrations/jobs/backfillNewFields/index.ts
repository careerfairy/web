import { CustomJob } from "@careerfairy/shared-lib/src/customJobs/customJobs"
import * as cliProgress from "cli-progress"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"

const jobProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions("Processing Custom Jobs", "Custom Jobs Processed"),
   cliProgress.Presets.shades_classic
)

const counter = new Counter()

/**
 * Main function to run the migration
 * It retrieves all custom jobs, then updates each document with the required fields
 */
export async function run() {
   const bulkWriter = firestore.bulkWriter()

   try {
      const customJobs = await logAction(
         () =>
            firestore
               .collection("customJobs")
               .get()
               .then((refs) => refs.docs.map((ref) => ref.data() as CustomJob)),
         "Fetching all custom jobs"
      )

      counter.addToReadCount(customJobs.length)

      jobProgressBar.start(customJobs.length, 0)

      for (const customJob of customJobs) {
         const newCustomJobRef = firestore
            .collection("customJobs")
            .doc(customJob.id)

         bulkWriter.update(newCustomJobRef, {
            sparks: [],
            published: Boolean(customJob.livestreams?.length),
            deadline: customJob.deadline ?? null,
         })

         counter.writeIncrement()
         counter.customCountIncrement("Migrated Custom Jobs")
         jobProgressBar.increment()
      }

      jobProgressBar.stop()

      await logAction(() => bulkWriter.close(), "Closing BulkWriter")
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}
