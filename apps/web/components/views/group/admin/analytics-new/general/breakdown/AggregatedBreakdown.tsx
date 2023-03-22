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

type LeftTabValue = keyof typeof leftTabOptions
type RightTabValue = keyof typeof rightTabOptions

const initialLeftTabValue: LeftTabValue = "Country"
const initialRightTabValue: RightTabValue = "registrations"
const AggregatedBreakdownChart = () => {
   const { group } = useGroup()
   const { fieldsOfStudyLookup, livestreamStats, livestreamStatsTimeFrame } =
      useAnalyticsPageContext()

   const [page, setPage] = useState(1)
   const [leftTabsValue, setLeftTabsValue] =
      useState<LeftTabValue>(initialLeftTabValue)
   const [rightTabsValue, setRightTabsValue] =
      useState<RightTabValue>(initialRightTabValue)

   const isEmpty = livestreamStats.length === 0

   useEffect(() => {
      resetTabs()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isEmpty])

   useEffect(() => {
      resetPage()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [leftTabsValue, rightTabsValue, livestreamStatsTimeFrame])

   const breakDownsKey: keyof ReturnType<typeof getBreakdowns> =
      `${rightTabsValue}By${leftTabsValue}` as const

   const breakDowns = useMemo(
      () => getBreakdowns(livestreamStats ?? [], fieldsOfStudyLookup),
      [livestreamStats, fieldsOfStudyLookup]
   )

   const results = useMemo(
      () => getResults(breakDowns[breakDownsKey], page),
      [breakDowns, breakDownsKey, page]
   )

   const onPageChange = useCallback(
      (event: React.ChangeEvent<unknown>, value: number) => {
         setPage(value)
      },
      []
   )

   const resetPage = useCallback(() => setPage(1), [])

   const resetTabs = useCallback(() => {
      setLeftTabsValue(initialLeftTabValue)
      setRightTabsValue(initialRightTabValue)
   }, [])

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

   const title = useMemo(() => {
      const str = `${rightTabOptions[rightTabsValue]} by ${leftTabOptions[leftTabsValue]}`
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
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
               sources={isEmpty ? emptySources : results.pageData}
               leftHeaderComponent={
                  <Box pb={2} display="flex" justifyContent="flex-start">
                     <TabsComponent
                        tabOptions={leftTabOptionsArray}
                        value={leftTabsValue}
                        onChange={handleLeftTabChange}
                        disabled={isEmpty}
                     />
                  </Box>
               }
               rightHeaderComponent={
                  <Box display="flex" justifyContent="flex-end">
                     <TabsComponent
                        tabOptions={rightTabOptionsArray}
                        value={rightTabsValue}
                        onChange={handleRightTabChange}
                        disabled={isEmpty}
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
                  count={results.totalPages}
                  page={page}
                  siblingCount={0}
                  boundaryCount={0}
                  shape="circular"
                  color="secondary"
                  onChange={onPageChange}
                  size="small"
               />
               <Box mt={2}>
                  <SubheaderLink
                     title="Go to streams analytics"
                     link={`/group/${group?.id}/admin/analytics/live-stream`}
                  />
               </Box>
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

const getResults = (
   allData: SourceEntryArgs[],
   currentPage: number
): {
   total: number // total number of sources
   pageSize: number // number of sources to display per page
   totalPages: number // total number of pages
   pageData: SourceEntryArgs[] // data to display on the current page
} => {
   const total = allData.length
   const pageSize = maxNumberOfSourcesToDisplay
   const totalPages = Math.ceil(total / pageSize)
   const pageData = allData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
   )

   return {
      total,
      pageSize,
      totalPages,
      pageData,
   }
}
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

const emptySources: SourceEntryArgs[] = Object.entries(universityCountriesMap)
   .slice(0, maxNumberOfSourcesToDisplay)
   .map(([key, value]) => ({
      value: 0,
      label: value,
      id: key,
      percent: 0,
      help: `Number of participants from ${value}`,
      name: value,
   }))

export default AggregatedBreakdown
