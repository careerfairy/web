import { SingleBar } from "cli-progress"
import { TrigramsMethod } from "@careerfairy/shared-lib/dist/utils/search"
import counterConstants from "../lib/Counter/constants"
import Counter from "../lib/Counter"
import { DocRef } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { BulkWriter } from "firebase-admin/firestore"

const WRITE_BATCH = 50

type TrigramDocument = {
   id: string
   triGrams?: Record<string, true>
} & DocRef

export const backfillTrigrams = async <TDoc extends TrigramDocument>(
   docs: TDoc[],
   fields: (keyof TDoc & string)[],
   counter: Counter,
   bar: SingleBar,
   bulkWriter: BulkWriter,
   trigramsMethod: TrigramsMethod,
   displayName: string
): Promise<void> => {
   Counter.log(`Fetching all ${displayName}`)

   counter.addToReadCount(docs.length)
   bar.start(docs.length, 0)

   await updateDocuments(
      docs,
      fields,
      counter,
      bar,
      bulkWriter,
      trigramsMethod,
      displayName
   )

   await bulkWriter.close()
   bar.stop()
}

const updateDocuments = async <TDoc extends TrigramDocument>(
   documents: TDoc[],
   fields: (keyof TDoc & string)[],
   counter: Counter,
   bar: SingleBar,
   bulkWriter: BulkWriter,
   trigramsMethod: TrigramsMethod,
   displayName: string
): Promise<void> => {
   let idx = 0
   for (const document of documents) {
      const args = fields.map((field) => document[field] as string)
      const toUpdate: Pick<TDoc, "triGrams"> = {
         triGrams: trigramsMethod(...args),
      }

      if (Object.keys(toUpdate.triGrams).length === 0) {
         counter.addToCustomCount(
            `${displayName} without necessary fields, no trigrams generated`,
            1
         )
         bar.increment()
         continue
      }

      const docRef = document._ref

      bulkWriter
         // @ts-ignore
         .set(docRef, toUpdate, { merge: true })
         .then(() => {
            counter.writeIncrement()
         })
         .catch((error) => {
            console.error("bulkWriter.set failed", error, document.id)
            counter.addToCustomCount(counterConstants.numFailedWrites, 1)
         })
         .finally(() => {
            bar.increment()
         })

      if (++idx % WRITE_BATCH === 0) {
         await bulkWriter.flush()
      }
   }
}
