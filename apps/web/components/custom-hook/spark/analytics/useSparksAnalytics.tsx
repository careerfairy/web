import { useMemo } from "react"
import useSWR from "swr"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../../utils/useFunctionsSWRFetcher"
import { convertToClientModel } from "components/custom-hook/spark/analytics/dataTransformers"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { createLookup } from "@careerfairy/shared-lib/utils"
import {
   FieldOfStudy,
   LevelOfStudy,
} from "@careerfairy/shared-lib/fieldOfStudy"

const useSparksAnalytics = (groupId: string) => {
   const { data: fieldsOfStudy } =
      useFirestoreCollection<FieldOfStudy>("fieldsOfStudy")
   const { data: levelsOfStudy } =
      useFirestoreCollection<LevelOfStudy>("levelsOfStudy")

   const fieldsOfStudyLookup = createLookup(fieldsOfStudy, "name")
   const levelsOfStudyLookup = createLookup(levelsOfStudy, "name")

   const fetcher = useFunctionsSWR()

   const { data } = useSWR(
      ["getSparksAnalytics", { groupId }],
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
