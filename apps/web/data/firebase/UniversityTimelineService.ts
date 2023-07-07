import {
   addDoc,
   collection,
   deleteDoc,
   doc,
   Firestore,
   getDoc,
   getDocs,
   where,
   query,
   Timestamp,
   setDoc,
} from "firebase/firestore"
import { FirestoreInstance } from "./FirebaseInstance"
import {
   UniversityPeriodType,
   TimelineUniversity,
} from "@careerfairy/shared-lib/universities/universityTimeline"
import {
   createGenericConverter,
   mapFirestoreDocuments,
} from "@careerfairy/shared-lib/BaseFirebaseRepository"

export class UniversityTimelineService {
   constructor(private readonly firestore: Firestore) {}

   // UNIVERSITIES

   /**
    * Adds a TimelineUniversity to the database
    *
    * A promise will be created but not awaited
    *
    * @param name - university name
    * @param country - university country location
    */
   addTimelineUniversity(name: string, country: string) {
      // let firestore generate a document id
      return addDoc(collection(this.firestore, "timelineUniversities"), {
         name: name,
         country: country,
      })
   }

   updateTimelineUniversity(name: string, country: string, docId: string) {
      setDoc(doc(this.firestore, "timelineUniversities", docId), {
         name: name,
         country: country,
      })
   }

   removeTimelineUniversity(uniId: string) {
      deleteDoc(doc(this.firestore, "timelineUniversities", uniId))
   }

   // PERIODS

   addUniversityPeriod(
      uniId: string,
      type: UniversityPeriodType,
      start: Date,
      end: Date
   ) {
      let periodRef = collection(
         this.firestore,
         "timelineUniversities",
         uniId,
         "periods"
      )
      let data = {
         type: type,
         start: Timestamp.fromDate(start),
         end: Timestamp.fromDate(end),
      }
      return addDoc(periodRef, data)
   }

   updateUniversityPeriod(
      uniId: string,
      type: UniversityPeriodType,
      start: Date,
      end: Date,
      periodId: string
   ) {
      let period = doc(
         this.firestore,
         "timelineUniversities",
         uniId,
         "periods",
         periodId
      )
      let data = {
         type: type,
         start: Timestamp.fromDate(start),
         end: Timestamp.fromDate(end),
      }
      setDoc(period, data)
   }

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
