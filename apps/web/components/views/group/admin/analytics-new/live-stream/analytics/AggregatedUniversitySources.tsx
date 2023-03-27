import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useLivestreamsAnalyticsPageContext } from "../LivestreamAnalyticsPageProvider"
import {
   getClientPaginatedSources,
   LoadingSourcesProgress,
   SourcesProgress,
} from "../../../common/SourcesProgress"
import CardCustom, { StyledPagination } from "../../../common/CardCustom"
import Stack from "@mui/material/Stack"
import { TabsComponent, TabsSkeleton } from "../../../common/Tabs"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import {
   getBreakdowns,
   getBreakdownsTitle,
   getEmptySources,
} from "../../../common/util"

const styles = sxStyles({
   root: {
      "& .MuiCardContent-root": {
         flex: 1,
      },
   },
})

const tabOptions = {
   Country: {
      label: "University Country",
   },
   FieldOfStudy: {
      label: "Field Of Study",
   },
} as const

const tabProps = Object.keys(tabOptions).map((key) => ({
   value: key,
   label: tabOptions[key].label,
}))

type SourcesTab = keyof typeof tabOptions

const initialTab: SourcesTab = "Country"

const maxNumberOfSourcesToDisplay = 6

const AggregatedUniversitySources = () => {
   const { fieldsOfStudyLookup, currentStreamStats } =
      useLivestreamsAnalyticsPageContext()

   const isLoading =
      currentStreamStats === undefined ||
      Object.keys(fieldsOfStudyLookup).length === 0

   if (isLoading) {
      return <AggregatedUniversitySourcesChartSkeleton />
   }
   return <AggregatedUniversitySourcesChart />
}

const AggregatedUniversitySourcesChart = () => {
   const { currentStreamStats, fieldsOfStudyLookup, userType } =
      useLivestreamsAnalyticsPageContext()
   const isMobile = useIsMobile()

   const [tab, setTab] = useState<SourcesTab>(initialTab)
   const [page, setPage] = useState(1)

   const handleTabChange = (
      event: React.SyntheticEvent<Element, Event>,
      value: SourcesTab
   ) => {
      setTab(value)
   }

   const resetPage = useCallback(() => {
      // reset page
      setPage(1)
   }, [])

   const onPageChange = useCallback(
      (event: React.ChangeEvent<unknown>, value: number) => {
         setPage(value)
      },
      []
   )

   const breakDownsKey: keyof ReturnType<typeof getBreakdowns> =
      `${userType}By${tab}` as const

   const breakDowns = useMemo(
      () =>
         getBreakdowns(
            currentStreamStats ? [currentStreamStats] : [],
            fieldsOfStudyLookup
         ),
      [fieldsOfStudyLookup, currentStreamStats]
   )

   const results = useMemo(
      () =>
         getClientPaginatedSources(
            breakDowns[breakDownsKey],
            page,
            maxNumberOfSourcesToDisplay
         ),
      [breakDowns, breakDownsKey, page]
   )

   const emptySources = useMemo(
      () =>
         getEmptySources(
            tab,
            userType,
            maxNumberOfSourcesToDisplay,
            fieldsOfStudyLookup
         ),
      [fieldsOfStudyLookup, tab, userType]
   )

   useEffect(() => {
      resetPage()
   }, [tab, resetPage, userType])

   // As the sources are sorted by the number of registrations/participants, we can just check if the first source has 0 registrations/participants
   const allSourcesAreEmpty = !breakDowns[breakDownsKey][0]?.value

   const isEmpty = !currentStreamStats || allSourcesAreEmpty

   if (!currentStreamStats) {
      return <div>Loading AggregatedUniversitySources</div>
   }

   return (
      <CardCustom
         sx={styles.root}
         title={
            <Stack
               spacing={1}
               direction={isMobile ? "column" : "row"}
               alignItems={isMobile ? "flex-start" : "center"}
               justifyContent="space-between"
            >
               <span>{getBreakdownsTitle(breakDownsKey)}</span>
               <TabsComponent
                  tabOptions={tabProps}
                  value={tab}
                  onChange={handleTabChange}
               />
            </Stack>
         }
      >
         <Stack
            height={"100%"}
            justifyContent={"space-between"}
            flex={1}
            spacing={2}
            mt={isMobile ? 0 : 1}
            display={"flex"}
         >
            <SourcesProgress
               sources={isEmpty ? emptySources : results.pageData}
               flat={!isMobile}
            />
            <Stack
               direction={"row"}
               flexWrap={"wrap"}
               justifyContent={"end"}
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
            </Stack>
         </Stack>
      </CardCustom>
   )
}

const AggregatedUniversitySourcesChartSkeleton = () => {
   const isMobile = useIsMobile()

   return (
      <CardCustom
         title={
            <Stack
               direction={"row"}
               alignItems={"center"}
               justifyContent="space-between"
            >
               <>Registrations by country</>
               <TabsSkeleton />
            </Stack>
         }
         sx={styles.root}
      >
         <Stack
            height={"100%"}
            justifyContent={"space-between"}
            flex={1}
            spacing={2}
            display={"flex"}
         >
            <LoadingSourcesProgress
               numberOfSources={maxNumberOfSourcesToDisplay}
               flat={!isMobile}
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

export default AggregatedUniversitySources
