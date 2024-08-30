import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"
import { SparksAnalyticsDTO } from "@careerfairy/shared-lib/sparks/analytics"
import { createLookup } from "@careerfairy/shared-lib/utils"
import { convertToClientModel } from "components/custom-hook/spark/analytics/dataTransformers"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { useMemo } from "react"
import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../../utils/useFunctionsSWRFetcher"

const useSparksAnalytics = (groupId: string) => {
   const { data: fieldsOfStudy } =
      useFirestoreCollection<FieldOfStudy>("fieldsOfStudy")
   const { data: levelsOfStudy } =
      useFirestoreCollection<LevelOfStudy>("levelsOfStudy")

   const fieldsOfStudyLookup = createLookup(fieldsOfStudy, "name")
   const levelsOfStudyLookup = createLookup(levelsOfStudy, "name")

   const fetcher = useFunctionsSWR()

   const { data } = useSWR<SparksAnalyticsDTO>(
      ["getSparksAnalytics_v3", { groupId }],
      fetcher,
      reducedRemoteCallsOptions
   )

   return useMemo(() => {
      return convertToClientModel(
         data,
         fieldsOfStudyLookup,
         levelsOfStudyLookup
      )
   }, [data, fieldsOfStudyLookup, levelsOfStudyLookup])
}

export default useSparksAnalytics
