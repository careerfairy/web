import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { LIVESTREAM_REPLICAS } from "@careerfairy/shared-lib/livestreams/search"
import { queryParamToArr } from "@careerfairy/shared-lib/utils"
import {
   Box,
   Card,
   CircularProgress,
   Container,
   Grid,
   Typography,
} from "@mui/material"
import {
   FilterOptions,
   useLivestreamSearchAlgolia,
} from "components/custom-hook/live-stream/useLivestreamSearchAlgolia"
import { isInIframe } from "components/helperFunctions/HelperFunctions"
import { usePartnership } from "HOCs/PartnershipProvider"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Search as FindIcon } from "react-feather"
import { useInView } from "react-intersection-observer"
import { useDebounce } from "react-use"
import { LivestreamSearchResult } from "types/algolia"
import useIsMobile from "../../../../components/custom-hook/useIsMobile"
import Link from "../../../../components/views/common/Link"
import { wishListBorderRadius } from "../../../../constants/pages"
import { sxStyles } from "../../../../types/commonTypes"
import { useFieldsOfStudy } from "../../../custom-hook/useCollection"
import LivestreamSearch from "../../group/admin/common/LivestreamSearch"
import { buildDialogLink } from "../../livestream-dialog"
import Filter, { FilterEnum } from "../filter/Filter"
import NoResultsMessage from "./NoResultsMessage"
import RecentLivestreamsSection from "./RecentLivestreamsSection"
import { StreamsSection } from "./StreamsSection"

const styles = sxStyles({
   noResultsMessage: {
      maxWidth: "800px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
      textAlign: "center",
   },
   root: {
      flex: 1,
      display: "flex",
      marginX: { xs: 2, md: 3 },
   },
   search: {
      flex: 1,
   },
   filter: {
      ml: { xs: 2, md: 4 },
      backgroundColor: "white",
      borderRadius: wishListBorderRadius,
   },
   loader: {
      display: "flex",
      justifyContent: "center",
   },
})

const getQueryVariables = (query: ParsedUrlQuery) => {
   const recordedOnly = query.recordedOnly as string
   const companyId = query.companyId as string

   return {
      languages: queryParamToArr(query.languages),
      companyCountries: queryParamToArr(query.companyCountries),
      companyIndustries: queryParamToArr(query.companyIndustries),
      fieldsOfStudy: queryParamToArr(query.fieldsOfStudy),
      recordedOnly: recordedOnly?.toLowerCase() === "true" || false,
      companyId: companyId || null,
      denyRecordingAccess: recordedOnly === "true" ? false : undefined,
   }
}

type Props = {
   initialTabValue?: "upcomingEvents" | "pastEvents"
}

const NextLiveStreamsWithFilter = ({
   initialTabValue = "upcomingEvents",
}: Props) => {
   const router = useRouter()
   const { query, push } = router
   const { handlePartnerEventClick } = usePartnership()

   const { data: allFieldsOfStudy } = useFieldsOfStudy()
   const [inputValue, setInputValue] = useState("")
   const [debouncedInputValue, setDebouncedInputValue] = useState("")

   useDebounce(
      () => {
         setDebouncedInputValue(inputValue)
      },
      250,
      [inputValue]
   )

   const {
      languages,
      companyCountries,
      companyIndustries,
      fieldsOfStudy,
      companyId,
      denyRecordingAccess,
   } = useMemo(() => getQueryVariables(query), [query])

   const isMobile = useIsMobile()

   const { inView, ref } = useInView({
      rootMargin: "0px 0px 200px 0px",
   })

   const hasPastEvents = useMemo(
      () => initialTabValue === "pastEvents",
      [initialTabValue]
   )

   const filtersToShow = useMemo(
      () => [
         companyId ? FilterEnum.COMPANY_ID : null,
         hasPastEvents ? FilterEnum.RECORDED_ONLY : null,
         FilterEnum.LANGUAGES,
         FilterEnum.COMPANY_COUNTRIES,
         FilterEnum.COMPANY_INDUSTRIES,
         FilterEnum.FIELDS_OF_STUDY,
      ],
      [companyId, hasPastEvents]
   )

   const filterOptions = useMemo<FilterOptions>(
      () => ({
         arrayFilters: {
            companyCountries,
            companyIndustries,
            fieldOfStudyIdTags: fieldsOfStudy.filter(
               (id) => allFieldsOfStudy?.some((item) => item.id === id) || false
            ),
            languageCode: languages,
            ...(companyId && { groupIds: [companyId] }),
         },

         booleanFilters: {
            denyRecordingAccess,
            hidden: false,
            test: false,
            ...(initialTabValue === "upcomingEvents" && {
               hasEnded: false,
            }),
            ...(initialTabValue === "pastEvents" && {
               hasEnded: true,
            }),
         },
         dateFilter: hasPastEvents ? "past" : "future",
      }),
      [
         companyCountries,
         companyIndustries,
         fieldsOfStudy,
         languages,
         companyId,
         denyRecordingAccess,
         initialTabValue,
         hasPastEvents,
         allFieldsOfStudy,
      ]
   )

   const targetReplica =
      initialTabValue === "pastEvents"
         ? LIVESTREAM_REPLICAS.START_DESC
         : LIVESTREAM_REPLICAS.START_ASC

   const { data, setSize, isValidating } = useLivestreamSearchAlgolia(
      debouncedInputValue,
      filterOptions,
      targetReplica
   )

   const numberOfResults = data?.[0]?.nbHits || 0

   const hasAppliedFilters = Boolean(
      Object.values(filterOptions.arrayFilters).flat().length
   )

   const infiniteLivestreams = useMemo(() => {
      return data?.flatMap((page) => page.deserializedHits) || []
   }, [data])

   // Check if we should show recent livestreams (when there are < 6 upcoming and no filters/search)
   const shouldShowRecentLivestreams = useMemo(() => {
      return (
         initialTabValue === "upcomingEvents" &&
         infiniteLivestreams.length < 6 &&
         !hasAppliedFilters &&
         !inputValue &&
         !isValidating
      )
   }, [
      initialTabValue,
      infiniteLivestreams.length,
      hasAppliedFilters,
      inputValue,
      isValidating,
   ])

   // Fetch recent past livestreams when needed
   const recentLivestreamsFilterOptions = useMemo<FilterOptions>(
      () => ({
         arrayFilters: {},
         booleanFilters: {
            hidden: false,
            test: false,
            hasEnded: true,
         },
         dateFilter: "past",
      }),
      []
   )

   const {
      data: recentLivestreamsData,
      isValidating: isLoadingRecentLivestreams,
   } = useLivestreamSearchAlgolia(
      "",
      recentLivestreamsFilterOptions,
      LIVESTREAM_REPLICAS.START_DESC,
      !shouldShowRecentLivestreams, // disable when not needed
      9 // fetch exactly 9 items
   )

   const recentLivestreams = useMemo(() => {
      return recentLivestreamsData?.[0]?.deserializedHits?.slice(0, 9) || []
   }, [recentLivestreamsData])

   const isValidatingRef = useRef(isValidating)
   isValidatingRef.current = isValidating

   useEffect(() => {
      if (isValidatingRef.current) return

      if (inView) {
         setSize((prevSize) => prevSize + 1)
      }
   }, [inView, setSize])

   const noResultsMessage = useMemo<JSX.Element>(
      () => (
         <Grid xs={12} mt={4} mx={1} item>
            <Typography sx={styles.noResultsMessage} variant="h5">
               {/* eslint-disable-next-line react/no-unescaped-entities */}
               We didn't find any live stream matching your criteria. 😕{" "}
               {isMobile ? (
                  <Link
                     href={
                        hasPastEvents
                           ? "/past-livestreams"
                           : "/next-livestreams"
                     }
                  >
                     clear all filters
                  </Link>
               ) : null}
            </Typography>
            {isMobile ? null : (
               <Typography sx={styles.noResultsMessage} variant="h5">
                  Remove some filters or start anew by{" "}
                  <Link
                     href={
                        hasPastEvents
                           ? "/past-livestreams"
                           : "/next-livestreams"
                     }
                  >
                     clearing all filters
                  </Link>
                  .
               </Typography>
            )}
         </Grid>
      ),
      [hasPastEvents, isMobile]
   )

   // Clicking on a search result will open the detail page for the corresponding stream
   const handleSearch = useCallback(
      (hit: LivestreamSearchResult | null) => {
         if (!hit || typeof hit === "string") return

         // If the application is running in an iframe, open the link in a new tab with UTM tags
         if (isInIframe()) {
            handlePartnerEventClick(hit.id)
            return
         }

         void push(
            buildDialogLink({
               router,
               link: {
                  type: "livestreamDetails",
                  livestreamId: hit.id,
               },
               originSource: ImpressionLocation.nextLivestreamsSearchBar,
            }),
            undefined,
            {
               shallow: true,
               scroll: false,
            }
         )
      },
      [handlePartnerEventClick, push, router]
   )

   return (
      <>
         <Container maxWidth="xl" disableGutters sx={{ display: "flex" }}>
            <Box sx={styles.root}>
               <Card sx={styles.search}>
                  <LivestreamSearch
                     handleChange={handleSearch}
                     value={null}
                     endIcon={<FindIcon color={"black"} />}
                     hasPastEvents={hasPastEvents}
                     filterOptions={filterOptions}
                     inputValue={inputValue}
                     debouncedInputValue={debouncedInputValue}
                     setInputValue={setInputValue}
                     targetReplica={targetReplica}
                     freeSolo
                  />
               </Card>
               <Box sx={styles.filter}>
                  <Filter
                     filtersToShow={filtersToShow}
                     numberOfResults={numberOfResults}
                  />
               </Box>
            </Box>
         </Container>

         <StreamsSection
            value={initialTabValue}
            upcomingLivestreams={infiniteLivestreams}
            listenToUpcoming
            pastLivestreams={infiniteLivestreams}
            currentGroup={undefined}
            noResultsComponent={<NoResultsMessage message={noResultsMessage} />}
            showSeparator={false}
         />

         <Container maxWidth="xl" disableGutters>
            {shouldShowRecentLivestreams ? (
               <>
                  <Box
                     sx={{
                        height: "1px",
                        backgroundColor: "neutral.100",
                        width: "100%",
                        mt: 3, // 24px spacing from upcoming streams
                        mb: 3, // 24px spacing to recent streams
                     }}
                  />
                  <RecentLivestreamsSection
                     recentLivestreams={recentLivestreams}
                     isLoading={isLoadingRecentLivestreams}
                  />
               </>
            ) : null}
         </Container>

         {isValidating ? (
            <Box sx={styles.loader}>
               <CircularProgress />
            </Box>
         ) : null}
         <Box ref={ref} />
      </>
   )
}

export default NextLiveStreamsWithFilter
