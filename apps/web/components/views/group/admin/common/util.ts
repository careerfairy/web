import { GroupStats } from "@careerfairy/shared-lib/groups/stats"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import {
   sortAndFilterAndCalculatePercentage,
   SourceEntryArgs,
   updateEntries,
} from "./SourcesProgress"
import { universityCountriesMap } from "../../../../util/constants/universityCountries"
import {
   LeftTabValue,
   RightTabValue,
} from "../analytics-new/general/breakdown/AggregatedBreakdown"

/**
 * Sum the total of people reached
 *
 * Since the numberOfPeopleReached was introduced afterwards, it still has a small value for
 * some groups, lets sum it with the registrations until it catches up
 */
export function totalPeopleReached(stats: GroupStats) {
   if (!stats) return 0

   const companyPageViews =
      stats.generalStats?.numberOfPeopleReachedCompanyPage ?? 0

   const totalReached =
      stats.generalStats.numberOfPeopleReached + companyPageViews

   // # views are still low, sum with registrations
   if (totalReached < stats.generalStats.numberOfRegistrations) {
      return totalReached + stats.generalStats.numberOfRegistrations
   }

   return totalReached ?? 0
}

/**
 * Sum the total of people reached
 *
 * Since the numberOfPeopleReached was introduced afterwards, it still has a small value for
 * some live streams, lets sum it with the registrations until it catches up
 */
export function totalPeopleReachedByLivestreamStat(stats: LiveStreamStats) {
   if (!stats) return 0

   const totalReached = stats.generalStats?.numberOfPeopleReached ?? 0

   // # views are still low, sum with registrations
   if (totalReached < stats.generalStats?.numberOfRegistrations) {
      return totalReached + stats.generalStats.numberOfRegistrations
   }

   return totalReached ?? 0
}

/**
 * Get breakdowns for the given stats
 * @param stats - livestream stats array to get breakdowns from
 * @param fieldsOfStudyLookup - fields of study lookup object gotten from the firebase
 * @returns breakdowns object containing the breakdowns for the given stats based on the given fields of study , and the given countries
 * */
export const getBreakdowns = (
   stats: LiveStreamStats[],
   fieldsOfStudyLookup: Record<string, string>
): {
   participantsByCountry: SourceEntryArgs[]
   registrationsByCountry: SourceEntryArgs[]
   participantsByFieldOfStudy: SourceEntryArgs[]
   registrationsByFieldOfStudy: SourceEntryArgs[]
} => {
   const countriesByParticipants: SourceEntryArgs[] = []
   const countriesByRegistrations: SourceEntryArgs[] = []
   const fieldsOfStudyByParticipants: SourceEntryArgs[] = []
   const fieldsOfStudyByRegistrations: SourceEntryArgs[] = []

   stats.forEach((stat) => {
      const { fieldOfStudyStats, countryStats } = stat

      Object.keys(universityCountriesMap ?? {}).forEach((countryCode) => {
         const countryStat = countryStats?.[countryCode]
         const countryName = universityCountriesMap[countryCode]
         const numberOfParticipants = countryStat?.numberOfParticipants ?? 0
         const numberOfRegistrations = countryStat?.numberOfRegistrations ?? 0

         updateEntries(
            countriesByParticipants,
            countryName,
            numberOfParticipants,
            `Number of participants from ${countryName}`
         )

         updateEntries(
            countriesByRegistrations,
            countryName,
            numberOfRegistrations,
            `Number of registrations from ${countryName}`
         )
      })

      Object.keys(fieldsOfStudyLookup ?? {}).forEach((fieldOfStudyId) => {
         const fieldOfStudyStat = fieldOfStudyStats?.[fieldOfStudyId]
         const fieldOfStudyName = fieldsOfStudyLookup[fieldOfStudyId]

         const numberOfParticipants =
            fieldOfStudyStat?.numberOfParticipants ?? 0
         const numberOfRegistrations =
            fieldOfStudyStat?.numberOfRegistrations ?? 0

         updateEntries(
            fieldsOfStudyByParticipants,
            fieldOfStudyName,
            numberOfParticipants,
            `Number of participants with a background in ${fieldOfStudyName}`
         )

         updateEntries(
            fieldsOfStudyByRegistrations,
            fieldOfStudyName,
            numberOfRegistrations,
            `Number of registrations with a background in ${fieldOfStudyName}`
         )
      })
   })

   return {
      participantsByCountry: sortAndFilterAndCalculatePercentage(
         countriesByParticipants
      ),
      registrationsByCountry: sortAndFilterAndCalculatePercentage(
         countriesByRegistrations
      ),
      participantsByFieldOfStudy: sortAndFilterAndCalculatePercentage(
         fieldsOfStudyByParticipants
      ),
      registrationsByFieldOfStudy: sortAndFilterAndCalculatePercentage(
         fieldsOfStudyByRegistrations
      ),
   }
}

export const getBreakdownsTitle = (
   breakdownType: keyof ReturnType<typeof getBreakdowns>
) => {
   switch (breakdownType) {
      case "participantsByCountry":
         return "Participants by country"
      case "registrationsByCountry":
         return "Registrations by country"
      case "participantsByFieldOfStudy":
         return "Participants by field of study"
      case "registrationsByFieldOfStudy":
         return "Registrations by field of study"
      default:
         return ""
   }
}

/**
 * We need to create a list of empty sources to display in the chart depending on the breakdown type and the user type
 *  @param {LeftTabValue} breakdownType - breakdown type
 *  @param {RightTabValue} userType - user type
 *  @param {number} maxNumberOfSourcesToDisplay - max number of sources to display
 *  @param fieldsOfStudyLookup - fields of study lookup from the context/firestore
 *  @returns {Array} - list of empty sources
 * */
export const getEmptySources = (
   breakdownType: LeftTabValue,
   userType: RightTabValue,
   maxNumberOfSourcesToDisplay: number,
   fieldsOfStudyLookup: Record<string, string>
): SourceEntryArgs[] => {
   const targetLookup =
      breakdownType === "Country" ? universityCountriesMap : fieldsOfStudyLookup

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
}
