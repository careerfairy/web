import { firestore } from "../../../lib/firebase"
import Counter from "../../../lib/Counter"
import {
   handleBulkWriterError,
   handleBulkWriterSuccess,
   loopProgressBar,
   writeProgressBar,
} from "../../../util/bulkWriter"
import counterConstants from "../../../lib/Counter/constants"
import { universitiesRepo } from "../../../repositories"
import { UniversityCountry } from "@careerfairy/shared-lib/dist/universities"
import { BulkWriter } from "firebase-admin/lib/firestore"

export async function run() {
   const counter = new Counter()
   try {
      const bulkWriter = firestore.bulkWriter()
      const universitiesByCountries =
         await universitiesRepo.getAllUniversitiesByCountries()
      counter.addToReadCount(universitiesByCountries.length)

      addCountryIdToUniversitiesByCountry(
         universitiesByCountries,
         bulkWriter,
         counter
      )

      Counter.log("Committing all writes...")
      writeProgressBar.start(
         counter.write(),
         counter.getCustomCount(counterConstants.numSuccessfulWrites)
      )

      /*
       * Commits all enqueued writes and marks the BulkWriter instance as closed.
       * After calling close(), calling any method will throw an error.
       * Any retries scheduled as part of an onWriteError() handler will
       * be run before the close() promise resolves.
       * */
      await bulkWriter.close()
      writeProgressBar.stop()

      Counter.log("Finished committing! ")
   } catch (error) {
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

/**
 *
 * To add contryId to all the universities by country documents
 *
 * @param universitiesByCountries
 * @param bulkWriter
 * @param counter
 */
const addCountryIdToUniversitiesByCountry = (
   universitiesByCountries: UniversityCountry[],
   bulkWriter: BulkWriter,
   counter: Counter
) => {
   counter.setCustomCount(
      counterConstants.totalNumDocs,
      universitiesByCountries.length
   )
   loopProgressBar.start(universitiesByCountries.length, 0)

   universitiesByCountries.forEach((universitiesByCountry, index) => {
      counter.setCustomCount(counterConstants.currentDocIndex, index)
      loopProgressBar.update(index + 1)

      const universityRef = firestore
         .collection("universitiesByCountry")
         .doc(universitiesByCountry.id)

      const toUpdate: Partial<UniversityCountry> = {
         countryId: universitiesByCountry.id,
      }

      bulkWriter
         .set(universityRef, toUpdate, { merge: true })
         // .update(universityRef, toUpdate)
         .then(() => handleBulkWriterSuccess(counter))
         .catch((e) => handleBulkWriterError(e, counter))

      counter.writeIncrement()
   })
   loopProgressBar.stop()
}

const throwMigrationError = (message: string) => {
   throw new Error(`Migration canceled, Error Message: ${message}`)
}
