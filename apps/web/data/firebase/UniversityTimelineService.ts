import {
   addDoc,
   collection,
   deleteDoc,
   doc,
   Firestore,
   updateDoc,
} from "firebase/firestore"
import { FirestoreInstance } from "./FirebaseInstance"
import {
   TimelineUniversity,
   UniversityPeriod,
} from "@careerfairy/shared-lib/universities/universityTimeline"
import { Create } from "@careerfairy/shared-lib/commonTypes"

export class UniversityTimelineService {
   constructor(private readonly firestore: Firestore) {}

   /**
    * Adds a TimelineUniversity to the database
    *
    * A promise will be created but not awaited
    *
    * @param uni - the university data to add
    * @returns A promise to a DocumentReference of the newly created document
    */
   addTimelineUniversity(uni: Create<TimelineUniversity>) {
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
    * Removes a TimelineUniversity from the database
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
}

export const UniversityTimelineInstance = new UniversityTimelineService(
   FirestoreInstance as any
)

export default UniversityTimelineService
