import {
   addDoc,
   collection,
   collectionGroup,
   deleteDoc,
   doc,
   DocumentReference,
   Firestore,
   getDocs,
   query,
   setDoc,
   Timestamp,
   updateDoc,
   where,
   writeBatch,
} from "firebase/firestore"
import { FirestoreInstance } from "./FirebaseInstance"
import {
   TimelineUniversity,
   UniversityPeriod,
   UniversityPeriodObject,
} from "@careerfairy/shared-lib/universities/universityTimeline"
import { Create } from "@careerfairy/shared-lib/commonTypes"
import { utils, writeFile, read } from "xlsx"
import { chunkArray, removeDuplicates } from "@careerfairy/shared-lib/utils"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"

export class UniversityTimelineService {
   constructor(private readonly firestore: Firestore) {}

   /**
    * Adds a TimelineCountry to the database
    *
    * A promise will be created but not awaited
    *
    * @param countryCode - ISO-2 country code
    * @returns A promise to a DocumentReference of the newly created document
    */
   addTimelineCountry(countryCode: string) {
      return setDoc(doc(this.firestore, "timelineCountries", countryCode), {})
   }

   /**
    * Removes a TimelineCountry from the database
    *
    * A promise will be created but not awaited
    *
    * @param countryCode - the ISO-2 country code
    * @returns A promise resolved once the country has been sucessfully deleted
    */
   removeTimelineCountry(countryCode: string) {
      return deleteDoc(doc(this.firestore, "timelineCountries", countryCode))
   }

   /**
    * Adds a TimelineUniversity and the coresponding TimelineCountry to the database
    *
    * A promise will be created but not awaited
    *
    * @param uni - the university data to add
    * @returns A promise that resolves when both docs have been sucessfully written [country, uni]
    */
   addTimelineUniversity(uni: Create<TimelineUniversity>) {
      const countryPromise = setDoc(
         doc(this.firestore, "timelineCountries", uni.countryCode),
         {}
      )
      const uniPromise = addDoc(
         collection(this.firestore, "timelineUniversities"),
         uni
      )
      return Promise.all([countryPromise, uniPromise])
   }

   /**
    * Updates a TimelineUniversity in the database
    *
    * A promise will be created but not awaited
    *
    * @param uniId - document id of the university
    * @param uni - the university data to update
    *
    *  @returns A promise that resolves when the doc has been sucessfully updated
    */
   updateTimelineUniversity(uniId: string, uni: Partial<TimelineUniversity>) {
      return updateDoc(doc(this.firestore, "timelineUniversities", uniId), uni)
   }

   /**
    * Removes a TimelineUniversity and all associated periods from the database
    *
    * A promise will be created but not awaited
    *
    * @param uniId - the firestore document id of the university
    * @returns A promise that resolves when all docs have been sucessfully deleted
    */
   async removeTimelineUniversity(uniId: string) {
      const universityDoc = doc(this.firestore, "timelineUniversities", uniId)
      // Batch delete all associated periods
      const batch = writeBatch(this.firestore)
      const periodCollection = collection(universityDoc, "periods")
      const periods = await getDocs(periodCollection)
      periods.forEach((period) => {
         batch.delete(doc(periodCollection, period.id))
      })
      batch.delete(universityDoc)

      return batch.commit()
   }

   /**
    * Adds a UniversityPeriod to a given TimelineUniversity
    *
    * A promise will be created but not awaited
    *
    * @param uniId - the university document id
    * @param period - the period data to add
    * @returns A promise to a DocumentReference to the newly created document
    */
   addUniversityPeriod(uniId: string, period: Create<UniversityPeriod>) {
      const periodRef = collection(
         this.firestore,
         "timelineUniversities",
         uniId,
         "periods"
      )
      return addDoc(periodRef, period)
   }

   /**
    * Updates a UniversityPeriod in the database
    *
    * A promise will be created but not awaited
    *
    * @param uniId - the TimelineUniversity's document id
    * @param periodId - the document id of the period to update
    * @param period - the period data to update
    * @returns A promise resolved after sucessful update
    */
   updateUniversityPeriod(
      uniId: string,
      periodId: string,
      period: Partial<UniversityPeriod>
   ) {
      const periodRef = doc(
         this.firestore,
         "timelineUniversities",
         uniId,
         "periods",
         periodId
      )
      return updateDoc(periodRef, period)
   }

   /**
    * Deletes a UniversityPeriod from the database
    *
    * A promise will be created but not awaited
    *
    * @param uniId - the document id of the university
    * @param periodId - the document id of the period
    * @returns A promise resolved after sucessful deletion
    */
   removeUniversityPeriod(uniId: string, periodId: string) {
      return deleteDoc(
         doc(this.firestore, "timelineUniversities", uniId, "periods", periodId)
      )
   }

   /**
    * Handles the downloading of the Excel template used for periods batch upload
    */
   handleDownloadBatchPeriodsTemplate() {
      const workbook = utils.book_new()
      const worksheet_data = [
         ["University_name", "Period_type", "Period_start", "Period_end"], // This is the header row
      ]
      const worksheet = utils.aoa_to_sheet(worksheet_data)
      utils.book_append_sheet(workbook, worksheet, "Sheet1")

      // Write the workbook to a file and trigger a download
      const filename = "AcademicCalendar_BatchUpload_template.xlsx"
      writeFile(workbook, filename)
   }

   /**
    * Handles the batch uploading of university periods using the Excel template
    */
   handleAddBatchPeriods(
      event: React.ChangeEvent<HTMLInputElement>,
      countryCode: string,
      successNotification: (
         message: string
      ) => (dispatch: any) => Promise<void>,
      errorNotification: (
         error: string | Error,
         message: string
      ) => (dispatch: any) => Promise<void>
   ) {
      // get the file
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()

      reader.onload = async (e) => {
         const newlyCreatedUniversityRefs: DocumentReference[] = []
         const data = new Uint8Array(e.target?.result as ArrayBuffer)
         const workbook = read(data, { type: "array" })
         const firstSheetName = workbook.SheetNames[0]
         const worksheet = workbook.Sheets[firstSheetName]

         const jsonData = utils.sheet_to_json(worksheet, {
            raw: false,
            defval: null,
         })

         // get initial universities
         const timelineUniversitiesRef = collection(
            this.firestore,
            "timelineUniversities"
         )
         const timelineUniversitiesQuery = query(
            timelineUniversitiesRef,
            where("countryCode", "==", countryCode)
         )
         try {
            const initialUniversitiesSnapshot = await getDocs(
               timelineUniversitiesQuery
            )
            const initialUniversityNames: string[] = []
            initialUniversitiesSnapshot.forEach((doc) =>
               initialUniversityNames.push(doc.data().name)
            )

            // Batch all the writes together for efficiency and atomicity
            const universitiesBatch = writeBatch(this.firestore)

            // add universities in database when needed
            const validUniversityNames = jsonData.map((row, index) => {
               const name = row["University_name"]
               if (!name?.trim()) {
                  throwBatchError(index, "has a non-empty university name")
               }
               return name
            })
            const newUniversityNames = removeDuplicates(
               validUniversityNames
            ).filter((uniName) => !initialUniversityNames.includes(uniName))

            newUniversityNames.forEach((universityName) => {
               const universityDocRef = doc(timelineUniversitiesRef)
               newlyCreatedUniversityRefs.push(universityDocRef)

               return universitiesBatch.set(universityDocRef, {
                  name: universityName,
                  countryCode: countryCode,
               })
            })

            await universitiesBatch.commit()
         } catch (e) {
            errorNotification(e, e)
         }

         try {
            const periodsBatch = writeBatch(this.firestore)

            // get updated universites
            const updatedUniversitiesSnapshot = await getDocs(
               timelineUniversitiesQuery
            )
            const updatedUniversities = []
            updatedUniversitiesSnapshot.forEach((doc) =>
               updatedUniversities.push({
                  name: doc.data().name,
                  id: doc.id,
               })
            )

            // Get the period data from the file
            const validPeriodValues = Object.values(UniversityPeriodObject)
            const periods: Create<UniversityPeriod>[] = jsonData.map(
               (row, index) => {
                  const type = row["Period_type"]
                  if (!validPeriodValues.includes(type)) {
                     throwBatchError(
                        index,
                        `has a type of exactly one of:  ${validPeriodValues.join(
                           ", "
                        )}`
                     )
                  }

                  const start = new Date(row["Period_start"])
                  const end = new Date(row["Period_end"])
                  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                     throwBatchError(index, "has valid start and end dates")
                  }
                  if (start > end) {
                     throwBatchError(index, "starts before it ends")
                  }

                  const period = {
                     timelineUniversityId: updatedUniversities.find(
                        (university) =>
                           university.name == row["University_name"]
                     ).id,
                     type: type,
                     start: Timestamp.fromDate(start),
                     end: Timestamp.fromDate(end),
                  }

                  return period
               }
            )

            // Add the new periods
            periods.forEach((period) => {
               const newPeriodRef = doc(
                  collection(
                     timelineUniversitiesRef,
                     period.timelineUniversityId,
                     "periods"
                  )
               )
               periodsBatch.set(newPeriodRef, period)
            })

            await periodsBatch.commit()
            successNotification("Batch upload successful")
         } catch (e) {
            // if there is an error, delete all the universities that were just added
            errorNotification(e, e)
            const universitiesBatch = writeBatch(this.firestore)

            newlyCreatedUniversityRefs.forEach((uniRef) =>
               universitiesBatch.delete(uniRef)
            )

            universitiesBatch.commit()
         }
      }

      reader.readAsArrayBuffer(file)
   }

   /**
    * Fetches all periods whose end is after a certain date for a set of timeline universities from the database.
    *
    * @param universityIds - The IDs of the universities to fetch periods for.
    * @param start - The start date. Only periods ending after this date will be fetched.
    * @returns A promise that resolves to an array of university periods.
    */
   async getUniversityPeriodsByIdsAndStart(
      universityIds: string[],
      start: Date
   ) {
      if (!universityIds?.length) return []

      const chunkSize = 30 // Firestore only allows 30 "in" queries per query

      const periodQueryChunksQueryies = chunkArray(
         universityIds,
         chunkSize
      ).map((periodQueryChunk) =>
         getDocs(
            query(
               collectionGroup(this.firestore, "periods"),
               where("timelineUniversityId", "in", periodQueryChunk),
               where("end", ">=", start)
            ).withConverter(createGenericConverter<UniversityPeriod>())
         )
      )

      const periodQueryChunks = await Promise.all(periodQueryChunksQueryies)

      const periods: UniversityPeriod[] = []

      periodQueryChunks.forEach((periodQueryChunk) => {
         periods.push(...periodQueryChunk.docs.map((doc) => doc.data()))
      })

      return periods
   }
}

const throwBatchError = (periodIndex: number, errorMessage: string) => {
   throw new Error(
      `Make sure your period on line ${periodIndex + 1} ` + errorMessage
   )
}

export const UniversityTimelineInstance = new UniversityTimelineService(
   FirestoreInstance as any
)

export default UniversityTimelineService
