import { collection, collectionGroup, query, where } from "firebase/firestore"
import {
   FirestoreInstance,
   Timestamp,
} from "../../../data/firebase/FirebaseInstance"
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
 * Custom hook to get all periods for a set of timeline universities from the database
 **/
export const useUniversityPeriodsByIds = (uniIds: string[]) => {
   const periodQuery = query(
      collectionGroup(FirestoreInstance, "periods"),
      where("timelineUniversityId", "in", uniIds)
   )
   return useFirestoreCollection<UniversityPeriod>(periodQuery, {
      idField: "id",
      suspense: false,
   })
}

/**
 * Custom hook to get all periods after a certain date for a set of timeline universities from the database
 **/
export const useUniversityPeriodsByIdsAndStart = (
   uniIds: string[],
   start: Date
) => {
   //dummy query since no conditonal hooks allowed, and "in" does not allow empty arrays
   let ids = uniIds
   if (!ids || ids.length <= 0) {
      ids = ["filler"]
   }
   const periodQuery = query(
      collectionGroup(FirestoreInstance, "periods"),
      where("timelineUniversityId", "in", ids),
      where("start", ">=", Timestamp.fromDate(start))
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
