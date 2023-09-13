import {
   collection,
   collectionGroup,
   query,
   where,
   orderBy,
} from "firebase/firestore"
import {
   FirestoreInstance,
   Timestamp,
} from "../../../data/firebase/FirebaseInstance"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import {
   UniversityPeriod,
   UniversityPeriodType,
} from "@careerfairy/shared-lib/universities/universityTimeline"

import useSWR from "swr"
import { UniversityTimelineInstance } from "data/firebase/UniversityTimelineService"
import { useCallback } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

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
export const useUniversityPeriodsByIds = (universitiesIds: string[]) => {
   const periodQuery = query(
      collectionGroup(FirestoreInstance, "periods"),
      where("timelineUniversityId", "in", universitiesIds.slice(0, 30))
   )
   return useFirestoreCollection<UniversityPeriod>(periodQuery, {
      idField: "id",
      suspense: false,
   })
}

/**
 * Custom hook to get all periods whose end is after a certain date for a set of timeline universities from the database
 **/
export const useUniversityPeriodsByIdsAndStart = (
   universityIds: string[],
   start: Date
) => {
   const fetcher = useCallback(
      () =>
         UniversityTimelineInstance.getUniversityPeriodsByIdsAndStart(
            universityIds,
            start
         ),
      [universityIds, start]
   )

   return useSWR(
      universityIds && start ? [universityIds, start] : null,
      fetcher,
      {
         onError: (err) => {
            errorLogAndNotify(err, {
               message: "Error fetching university periods by ids and start",
               details: {
                  universityIds,
                  start,
               },
            })
         },
      }
   )
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
