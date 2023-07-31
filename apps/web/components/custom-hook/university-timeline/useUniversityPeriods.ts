import { collection, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import {
   UniversityPeriod,
   UniversityPeriodType,
} from "@careerfairy/shared-lib/universities/universityTimeline"

/**
 * Custom hook to get all periods for a timeline university from the database
 **/
export const useUniversityPeriods = (uniId: string) => {
   const periodQuery = query(
      collection(FirestoreInstance, "timelineUniversities", uniId, "periods")
   )
   return useFirestoreCollection<UniversityPeriod>(periodQuery, {
      idField: "id",
      suspense: false,
   })
}

/**
 * Custom hook to get a certain type of university periods for a given university
 **/
export const useUniversityPeriodsByType = (
   uniId: string,
   type: UniversityPeriodType
) => {
   const periodQuery = query(
      collection(FirestoreInstance, "timelineUniversities", uniId, "periods"),
      where("type", "==", type)
   )
   return useFirestoreCollection<UniversityPeriod>(periodQuery, {
      idField: "id",
      suspense: false,
   })
}
