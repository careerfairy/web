import React, { useCallback, useEffect, useMemo, useState } from "react"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import {
   LoadingSourcesProgress,
   sortAndFilterAndCalculatePercentage,
   SourceEntryArgs,
   SourcesProgress,
   updateEntries,
} from "../../../common/SourcesProgress"
import { universityCountriesMap } from "../../../../../../util/constants/universityCountries"
import { useAnalyticsPageContext } from "../GeneralPageProvider"
import CardCustom, {
   StyledPagination,
   SubheaderLink,
} from "../../../common/CardCustom"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { Box } from "@mui/material"
import { TabsComponent, TabsSkeleton } from "../../../common/Tabs"
import { titleCase } from "../../../../../../../util/CommonUtil"
import useClientSidePagination from "../../../../../../custom-hook/utils/useClientSidePagination"

const styles = sxStyles({
   root: {
      "& .MuiCardContent-root": {
         flex: 1,
      },
      minHeight: {
         md: 632,
      },
   },
})
const maxNumberOfSourcesToDisplay = 10

const leftTabOptions = {
   Country: "Country",
   FieldOfStudy: "Field of study",
} as const

const leftTabOptionsArray = Object.keys(leftTabOptions).map((key) => ({
   value: key,
   label: leftTabOptions[key],
}))

const rightTabOptions = {
   registrations: "Registrations",
   participants: "Participants",
} as const

const rightTabOptionsArray = Object.keys(rightTabOptions).map((key) => ({
   value: key,
   label: rightTabOptions[key],
}))

const AggregatedBreakdown = () => {
   const { fieldsOfStudyLookup, livestreamStats } = useAnalyticsPageContext()

   const isLoading =
      livestreamStats === undefined ||
      Object.keys(fieldsOfStudyLookup).length === 0

   if (isLoading) {
      return <AggregatedBreakdownChartSkeleton />
   }
   return <AggregatedBreakdownChart />
}

export type LeftTabValue = keyof typeof leftTabOptions
export type RightTabValue = keyof typeof rightTabOptions

const initialLeftTabValue: LeftTabValue = "Country"
const initialRightTabValue: RightTabValue = "registrations"

const AggregatedBreakdownChart = () => {
   const { group } = useGroup()
   const { fieldsOfStudyLookup, livestreamStats, livestreamStatsTimeFrame } =
      useAnalyticsPageContext()

   const [leftTabsValue, setLeftTabsValue] =
      useState<LeftTabValue>(initialLeftTabValue)
   const [rightTabsValue, setRightTabsValue] =
      useState<RightTabValue>(initialRightTabValue)

   const handleLeftTabChange = useCallback(
      (event: React.SyntheticEvent<Element, Event>, value: LeftTabValue) => {
         setLeftTabsValue(value)
      },
      []
   )

   const handleRightTabChange = useCallback(
      (event: React.SyntheticEvent<Element, Event>, value: RightTabValue) => {
         setRightTabsValue(value)
      },
      []
   )
   const breakDowns = useMemo(
      () => getBreakdowns(livestreamStats ?? [], fieldsOfStudyLookup),
      [livestreamStats, fieldsOfStudyLookup]
   )

   const breakDownsKey: keyof ReturnType<typeof getBreakdowns> =
      `${rightTabsValue}By${leftTabsValue}` as const

   const {
      currentPageData: results,
      currentPage,
      totalPages,
      goToPage,
   } = useClientSidePagination({
      itemsPerPage: maxNumberOfSourcesToDisplay,
      data: breakDowns[breakDownsKey],
   })

   const onPageChange = useCallback(
      (event: React.ChangeEvent<unknown>, value: number) => {
         goToPage(value)
      },
      [goToPage]
   )

   const resetPage = useCallback(() => goToPage(1), [goToPage])

   useEffect(() => {
      resetPage()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [leftTabsValue, rightTabsValue, livestreamStatsTimeFrame])

   // As the sources are sorted by the number of registrations/participants, we can just check if the first source has 0 registrations/participants
   const allSourcesAreEmpty = !breakDowns[breakDownsKey][0]?.value

   const isEmpty = livestreamStats.length === 0 || allSourcesAreEmpty

   const emptySources = useMemo(
      () =>
         getEmptySources(
            leftTabsValue,
            rightTabsValue,
            maxNumberOfSourcesToDisplay,
            fieldsOfStudyLookup
         ),
      [leftTabsValue, rightTabsValue, fieldsOfStudyLookup]
   )

   const title = useMemo(() => {
      const str =
         `${rightTabOptions[rightTabsValue]} by ${leftTabOptions[leftTabsValue]}` as const
      return titleCase(str)
   }, [leftTabsValue, rightTabsValue])

   return (
      <CardCustom sx={styles.root} title={title}>
         <Stack
            height={"100%"}
            justifyContent={"space-between"}
            flex={1}
            spacing={2}
            display={"flex"}
         >
            <SourcesProgress
               sources={isEmpty ? emptySources : results}
               leftHeaderComponent={
                  <Box pb={2} display="flex" justifyContent="flex-start">
                     <TabsComponent
                        tabOptions={leftTabOptionsArray}
                        value={leftTabsValue}
                        onChange={handleLeftTabChange}
                     />
                  </Box>
               }
               rightHeaderComponent={
                  <Box display="flex" justifyContent="flex-end">
                     <TabsComponent
                        tabOptions={rightTabOptionsArray}
                        value={rightTabsValue}
                        onChange={handleRightTabChange}
                     />
                  </Box>
               }
            />
            <Stack
               direction={"row"}
               flexWrap={"wrap"}
               justifyContent={"space-between"}
               alignItems={"center"}
               spacing={1}
            >
               <StyledPagination
                  count={totalPages}
                  page={currentPage}
                  siblingCount={0}
                  boundaryCount={0}
                  shape="circular"
                  color="secondary"
                  onChange={onPageChange}
                  size="small"
               />
               <SubheaderLink
                  title="Go to streams analytics"
                  link={`/group/${group?.id}/admin/analytics/live-stream`}
               />
            </Stack>
         </Stack>
      </CardCustom>
   )
}

const AggregatedBreakdownChartSkeleton = () => {
   return (
      <CardCustom sx={styles.root} title={"Live streams KPIs overview"}>
         <Stack
            height={"100%"}
            justifyContent={"space-between"}
            flex={1}
            spacing={2}
            display={"flex"}
         >
            <LoadingSourcesProgress
               leftHeaderComponent={
                  <Box>
                     <TabsSkeleton />
                  </Box>
               }
               rightHeaderComponent={
                  <Box mb={2} display="flex" justifyContent="flex-end">
                     <TabsSkeleton />
                  </Box>
               }
               numberOfSources={maxNumberOfSourcesToDisplay}
            />
            <StyledPagination
               count={1}
               page={1}
               onChange={() => {}}
               siblingCount={0}
               boundaryCount={0}
               shape="circular"
               color="secondary"
               disabled
               size="small"
            />
         </Stack>
      </CardCustom>
   )
}

/**
 * Get breakdowns for the given stats
 * @param stats - livestream stats array to get breakdowns from
 * @param fieldsOfStudyLookup - fields of study lookup object gotten from the firebase
 * @returns breakdowns object containing the breakdowns for the given stats based on the given fields of study , and the given countries
 * */
const getBreakdowns = (
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

/**
 * We need to create a list of empty sources to display in the chart depending on the breakdown type and the user type
 *  @param {LeftTabValue} breakdownType - breakdown type
 *  @param {RightTabValue} userType - user type
 *  @param {number} maxNumberOfSourcesToDisplay - max number of sources to display
 *  @param fieldsOfStudyLookup - fields of study lookup from the context/firestore
 *  @returns {Array} - list of empty sources
 * */
const getEmptySources = (
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

export default AggregatedBreakdown
