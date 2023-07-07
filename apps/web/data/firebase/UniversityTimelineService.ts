import {
   addDoc,
   collection,
   deleteDoc,
   doc,
   Firestore,
   Timestamp,
   setDoc,
} from "firebase/firestore"
import { FirestoreInstance } from "./FirebaseInstance"
import { UniversityPeriodType } from "@careerfairy/shared-lib/universities/universityTimeline"

export class UniversityTimelineService {
   constructor(private readonly firestore: Firestore) {}

   /**
    * Adds a TimelineUniversity to the database
    *
    * A promise will be created but not awaited
    *
    * @param name - university name
    * @param country - university country location
    * @returns A promise to a DocumentReference of the newly created document
    */
   addTimelineUniversity(name: string, country: string) {
      return addDoc(collection(this.firestore, "timelineUniversities"), {
         name: name,
         country: country,
      })
   }

   /**
    * Updates a TimelineUniversity in the database
    *
    * A promise will be created but not awaited
    *
    * @param name - name of the university
    * @param country - country of the university
    * @param docId - firestore document id of the university
    */
   updateTimelineUniversity(name: string, country: string, uniId: string) {
      setDoc(doc(this.firestore, "timelineUniversities", uniId), {
         name: name,
         country: country,
      })
   }

   /**
    * Updates a TimelineUniversity in the database
    *
    * A promise will be created but not awaited
    *
    * @param uniId - the firestore document id of the university
    */
   removeTimelineUniversity(uniId: string) {
      deleteDoc(doc(this.firestore, "timelineUniversities", uniId))
   }

   /**
    * Adds a UniversityPeriod to a given TimelineUniversity
    *
    * A promise will be created but not awaited
    *
    * @param uniId - the university document id
    * @param type - the type of the period
    * @param start - the start date of the period
    * @param end - the end date of the period
    * @returns A promise to a DocumentReference to the newly created document
    */
   addUniversityPeriod(
      uniId: string,
      type: UniversityPeriodType,
      start: Date,
      end: Date
   ) {
      const periodRef = collection(
         this.firestore,
         "timelineUniversities",
         uniId,
         "periods"
      )
      const data = {
         type: type,
         start: Timestamp.fromDate(start),
         end: Timestamp.fromDate(end),
      }
      return addDoc(periodRef, data)
   }

   /**
    * Updates a UniversityPeriod in the database
    *
    * A promise will be created but not awaited
    *
    * @param uniId - the TimelineUniversity's document id
    * @param type - the new type of the period
    * @param start - the new start date of the period
    * @param end - the new end date of the period
    * @param periodId - the id of the period to update
    */
   updateUniversityPeriod(
      uniId: string,
      type: UniversityPeriodType,
      start: Date,
      end: Date,
      periodId: string
   ) {
      const period = doc(
         this.firestore,
         "timelineUniversities",
         uniId,
         "periods",
         periodId
      )
      const data = {
         type: type,
         start: Timestamp.fromDate(start),
         end: Timestamp.fromDate(end),
      }
      setDoc(period, data)
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
}

export const UniversityTimelineInstance = new UniversityTimelineService(
   FirestoreInstance as any
)

export default UniversityTimelineService
