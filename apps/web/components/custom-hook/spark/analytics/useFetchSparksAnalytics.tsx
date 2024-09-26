import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { createLookup } from "@careerfairy/shared-lib/utils"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { sparksAnalyticsService } from "data/firebase/SparksAnalyticsService"
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
         const fetchedAnalytics =
            await sparksAnalyticsService.fetchSparksAnalytics(
               groupId,
               updateCache
            )
         return convertToClientModel(
            fetchedAnalytics,
            fieldsOfStudyLookup,
            levelsOfStudyLookup
         )
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
