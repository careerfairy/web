import {
   addDoc,
   collection,
   deleteDoc,
   doc,
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
} from "@careerfairy/shared-lib/universities/universityTimeline"
import { Create } from "@careerfairy/shared-lib/commonTypes"
import { utils, writeFile, read } from "xlsx"
import { useCallback } from "react"

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
    */
   removeTimelineCountry(countryCode: string) {
      deleteDoc(doc(this.firestore, "timelineCountries", countryCode))
   }

   /**
    * Adds a TimelineUniversity and the coresponding TimelineCountry to the database
    *
    * A promise will be created but not awaited
    *
    * @param uni - the university data to add
    * @returns A promise to a DocumentReference of the newly created document
    */
   addTimelineUniversity(uni: Create<TimelineUniversity>) {
      setDoc(doc(this.firestore, "timelineCountries", uni.countryCode), {})
      return addDoc(collection(this.firestore, "timelineUniversities"), uni)
   }

   /**
    * Updates a TimelineUniversity in the database
    *
    * A promise will be created but not awaited
    *
    * @param uniId - document id of the university
    * @param uni - the university data to update
    */
   updateTimelineUniversity(uniId: string, uni: Partial<TimelineUniversity>) {
      updateDoc(doc(this.firestore, "timelineUniversities", uniId), uni)
   }

   /**
    * Removes a TimelineUniversity and all associated periods from the database
    *
    * A promise will be created but not awaited
    *
    * @param uniId - the firestore document id of the university
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

      batch.commit()
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
      updateDoc(periodRef, period)
   }

   /**
    * Deletes a UniversityPeriod from the database
    *
    * A promise will be created but not awaited
    *
    * @param uniId - the document id of the university
    * @param periodId - the document id of the period
    */
   removeUniversityPeriod(uniId: string, periodId: string) {
      deleteDoc(
         doc(this.firestore, "timelineUniversities", uniId, "periods", periodId)
      )
   }

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

   handleAddBatchPeriods(
      event: React.ChangeEvent<HTMLInputElement>,
      countryCode: string
   ) {
      // get the file
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()

      reader.onload = async (e) => {
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
         const newUniversityNames: string[] = jsonData
            .map((row) => row["University_name"])
            .reduce((acc, uniName) => {
               if (
                  !acc.includes(uniName) &&
                  !initialUniversityNames.includes(uniName)
               ) {
                  acc.push(uniName)
               }
               return acc
            }, [])

         newUniversityNames.forEach((universityName) =>
            universitiesBatch.set(doc(timelineUniversitiesRef), {
               name: universityName,
               countryCode: countryCode,
            })
         )

         await universitiesBatch.commit()

         const periodsBatch = writeBatch(this.firestore)

         // get updated universites
         const updatedUniversitiesSnapshot = await getDocs(
            timelineUniversitiesQuery
         )
         const updatedUniversities = []
         updatedUniversitiesSnapshot.forEach((doc) =>
            updatedUniversities.push({ name: doc.data().name, id: doc.id })
         )

         // Get the period data from the file
         const periods: Create<UniversityPeriod>[] = jsonData.map(
            (row: any) => {
               const period = {
                  timelineUniversityId: updatedUniversities.find(
                     (university) => university.name == row["University_name"]
                  ).id,
                  type: row["Period_type"],
                  start: Timestamp.fromDate(new Date(row["Period_start"])),
                  end: Timestamp.fromDate(new Date(row["Period_end"])),
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
      }

      reader.readAsArrayBuffer(file)
   }
}

export const UniversityTimelineInstance = new UniversityTimelineService(
   FirestoreInstance as any
)

export default UniversityTimelineService
