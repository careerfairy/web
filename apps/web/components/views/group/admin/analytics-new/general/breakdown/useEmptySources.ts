import { useMemo } from "react"
import { universityCountriesMap } from "../../../../../../util/constants/universityCountries"
import { useAnalyticsPageContext } from "../GeneralPageProvider"
import { LeftTabValue, RightTabValue } from "./AggregatedBreakdown"
import { SourceEntryArgs } from "../../../common/SourcesProgress"

/**
 * We need to create a list of empty sources to display in the chart depending on the breakdown type and the user type
 *  @param {LeftTabValue} breakdownType - breakdown type
 *  @param {RightTabValue} userType - user type
 *  @param {number} maxNumberOfSourcesToDisplay - max number of sources to display
 *  @returns {Array} - list of empty sources
 * */
const useEmptySources = (
   breakdownType: LeftTabValue,
   userType: RightTabValue,
   maxNumberOfSourcesToDisplay: number
): SourceEntryArgs[] => {
   const { fieldsOfStudyLookup } = useAnalyticsPageContext() // we need to get the fields of study lookup from the context/firestore

   return useMemo(() => {
      const targetLookup =
         breakdownType === "Country"
            ? universityCountriesMap
            : fieldsOfStudyLookup

      return Object.entries(targetLookup)
         .slice(0, maxNumberOfSourcesToDisplay) // we only want to display the first x sources
         .map(([key, value]) => ({
            value: 0,
            label: value,
            id: key,
            percent: 0,
            help: `Number of ${userType} from ${value}`,
            name: value,
         }))
   }, [
      breakdownType,
      fieldsOfStudyLookup,
      maxNumberOfSourcesToDisplay,
      userType,
   ])
}

export default useEmptySources
