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
         if (updateCache) {
            const fetchedAnalytics =
               await sparksAnalyticsService.fetchSparksAnalytics(groupId)
            return convertToClientModel(
               fetchedAnalytics,
               fieldsOfStudyLookup,
               levelsOfStudyLookup
            )
         } else {
            const fetchFromFirestore = async () => {
               const collectionRef = collection(
                  FirestoreInstance,
                  "sparksAnalytics"
               )
               const docRef = doc(collectionRef, groupId).withConverter(
                  createGenericConverter<SparksAnalyticsDTO>()
               )
               const docSnap = await getDoc(docRef)
               const data = docSnap.data()
               return data
            }

            const firestoreData = await fetchFromFirestore()

            return convertToClientModel(
               firestoreData,
               fieldsOfStudyLookup,
               levelsOfStudyLookup
            )
         }
      },
      [fieldsOfStudyLookup, levelsOfStudyLookup]
   )

   const {
      data: analytics,
      error,
      isLoading,
   } = useSWR(
      ["sparks-analytics", groupId],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, groupId]) => fetcher(groupId, false),
      {
         revalidateOnFocus: false,
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
      isLoading: isLoading || isMutating,
      updateAnalytics,
      isMutating,
   }
}
