import { collection, query, where, orderBy } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"
import { TimelineUniversity } from "@careerfairy/shared-lib/universities/universityTimeline"

/**
 * Custom hook to get timeline universities from the database
 **/
export const useTimelineUniversities = () => {
   const uniQuery = query(
      collection(FirestoreInstance, "timelineUniversities"),
      orderBy("name")
   )
   return useFirestoreCollection<TimelineUniversity>(uniQuery, {
      idField: "id",
      suspense: false,
   })
}

/**
 * Custom hook to get timeline universities for a given country from the database
 **/
export const useTimelineUniversitiesByCountry = (countryCode: string) => {
   const uniQuery = query(
      collection(FirestoreInstance, "timelineUniversities"),
      where("country", "==", countryCode)
   )
   return useFirestoreCollection<TimelineUniversity>(uniQuery, {
      idField: "id",
      suspense: false,
   })
}

/**
 * Custom hook to get a timeline university by its id
 **/
export const useTimelineUniversitiesById = (uniId: string) => {
   return useFirestoreDocument<TimelineUniversity>(
      "timelineUniversities",
      [uniId],
      {
         idField: "id",
         suspense: false,
      }
   )
}
