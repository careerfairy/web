import React, { useCallback, useMemo, useState } from "react"
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
import { TabsComponent, TabsSkeleton } from "../../../common/Tabs"
import { Box, Typography } from "@mui/material"

const styles = sxStyles({
   root: {
      "& .MuiCardContent-root": {
         flex: 1,
      },
      minHeight: 632,
   },
})
const maxNumberOfSourcesToDisplay = 8

const leftTabOptions = [
   { value: "Country", label: "Country" },
   { value: "FieldOfStudy", label: "Field of study" },
] as const

const rightTabOptions = [
   { value: "participants", label: "Participants" },
   { value: "registrants", label: "Registrants" },
] as const

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

type LeftTabValue = typeof leftTabOptions[number]["value"]
type RightTabValue = typeof rightTabOptions[number]["value"]
const AggregatedBreakdownChart = () => {
   const { group } = useGroup()
   const { fieldsOfStudyLookup, livestreamStats } = useAnalyticsPageContext()

   const [page, setPage] = useState(1)
   const [leftTabsValue, setLeftTabsValue] = useState<LeftTabValue>("Country")
   const [rightTabsValue, setRightTabsValue] =
      useState<RightTabValue>("participants")

   const breakDownsKey: keyof ReturnType<typeof getBreakdowns> =
      `${rightTabsValue}By${leftTabsValue}` as const

   const isEmpty = livestreamStats.length === 0

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

   const handleLeftTabChange = useCallback(
      (event: React.SyntheticEvent<Element, Event>, value: LeftTabValue) => {
         setLeftTabsValue(value)
         setPage(1)
      },
      []
   )

   const handleRightTabChange = useCallback(
      (event: React.SyntheticEvent<Element, Event>, value: RightTabValue) => {
         setRightTabsValue(value)
         setPage(1)
      },
      []
   )

   return (
      <CardCustom sx={styles.root} title={"Live streams KPIs overview"}>
         <Stack
            height={"100%"}
            justifyContent={"space-between"}
            flex={1}
            spacing={2}
            display={"flex"}
         >
            {isEmpty ? (
               <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flex={1}
               >
                  <Typography variant="h6" color="textSecondary">
                     No data available
                  </Typography>
               </Box>
            ) : (
               <SourcesProgress
                  sources={results.pageData}
                  leftHeaderComponent={
                     <Box pb={2} display="flex" justifyContent="flex-start">
                        <TabsComponent
                           tabOptions={leftTabOptions}
                           value={leftTabsValue}
                           onChange={handleLeftTabChange}
                        />
                     </Box>
                  }
                  rightHeaderComponent={
                     <Box display="flex" justifyContent="flex-end">
                        <TabsComponent
                           tabOptions={rightTabOptions}
                           value={rightTabsValue}
                           onChange={handleRightTabChange}
                        />
                     </Box>
                  }
               />
            )}
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
   registrantsByCountry: SourceEntryArgs[]
   participantsByFieldOfStudy: SourceEntryArgs[]
   registrantsByFieldOfStudy: SourceEntryArgs[]
} => {
   const countriesByParticipants: SourceEntryArgs[] = []
   const countriesByRegistrants: SourceEntryArgs[] = []
   const fieldsOfStudyByParticipants: SourceEntryArgs[] = []
   const fieldsOfStudyByRegistrants: SourceEntryArgs[] = []

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
            countriesByRegistrants,
            countryName,
            numberOfRegistrations,
            `Number of registrants from ${countryName}`
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
            `Number of participants from ${fieldOfStudyName}`
         )

         updateEntries(
            fieldsOfStudyByRegistrants,
            fieldOfStudyName,
            numberOfRegistrations,
            `Number of registrants from ${fieldOfStudyName}`
         )
      })
   })

   return {
      participantsByCountry: sortAndFilterAndCalculatePercentage(
         countriesByParticipants
      ),
      registrantsByCountry: sortAndFilterAndCalculatePercentage(
         countriesByRegistrants
      ),
      participantsByFieldOfStudy: sortAndFilterAndCalculatePercentage(
         fieldsOfStudyByParticipants
      ),
      registrantsByFieldOfStudy: sortAndFilterAndCalculatePercentage(
         fieldsOfStudyByRegistrants
      ),
   }
}

export default AggregatedBreakdown
