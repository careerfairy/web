import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { SparksAnalyticsDTO } from "@careerfairy/shared-lib/sparks/analytics"
import { createLookup } from "@careerfairy/shared-lib/utils"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { sparksAnalyticsService } from "data/firebase/SparksAnalyticsService"
import { collection, doc, getDoc } from "firebase/firestore"
import { useCallback, useMemo } from "react"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { convertToClientModel } from "./dataTransformers"

export const useFetchSparksAnalytics = (groupId: string) => {
   const { data: fieldsOfStudy } =
      useFirestoreCollection<FieldOfStudy>("fieldsOfStudy")
   const { data: levelsOfStudy } =
      useFirestoreCollection<LevelOfStudy>("levelsOfStudy")

   const fieldsOfStudyLookup = useMemo(
      () => createLookup(fieldsOfStudy, "name"),
      [fieldsOfStudy]
   )
   const levelsOfStudyLookup = useMemo(
      () => createLookup(levelsOfStudy, "name"),
      [levelsOfStudy]
   )

   const fetcher = useCallback(
      async (groupId: string, updateCache: boolean) => {
         const MAX_AGE = 60 * 60 * 1000 // 1 HOUR

         const collectionRef = collection(FirestoreInstance, "sparksAnalytics")
         const docRef = doc(collectionRef, groupId).withConverter(
            createGenericConverter<SparksAnalyticsDTO>()
         )
         const docSnap = await getDoc(docRef)

         // Determine if we need to refresh cache
         const needsRefresh = () => {
            if (updateCache) return true
            if (!docSnap.exists()) return true

            const data = docSnap.data()
            if (!data.updatedAt) return true

            const cacheAge = Date.now() - data.updatedAt.toDate().getTime()
            if (cacheAge > MAX_AGE) {
               return true
            }

            return false
         }

         // Fetch from BigQuery if needed, otherwise use cache
         let firestoreData: SparksAnalyticsDTO
         if (needsRefresh()) {
            firestoreData = await sparksAnalyticsService.fetchSparksAnalytics(
               groupId
            )
         } else {
            firestoreData = docSnap.data()
         }

         const result = convertToClientModel(
            firestoreData,
            fieldsOfStudyLookup,
            levelsOfStudyLookup
         )

         return result
      },
      [fieldsOfStudyLookup, levelsOfStudyLookup]
   )

   const {
      data: analytics,
      error,
      isLoading,
      isValidating,
   } = useSWR(
      ["sparks-analytics", groupId],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, groupId]) => {
         return fetcher(groupId, false)
      },
      {
         revalidateOnFocus: false,
         keepPreviousData: true,
      }
   )

   const { trigger: updateAnalytics, isMutating } = useSWRMutation(
      ["sparks-analytics", groupId],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, groupId]) => fetcher(groupId, true),
      {
         populateCache: true,
         revalidate: true,
      }
   )

   return {
      analytics,
      error,
      // Only show loading skeleton if there's no previous data
      isLoading: isLoading && !analytics,
      isValidating: isValidating || isMutating,
      updateAnalytics,
      isMutating,
   }
}
