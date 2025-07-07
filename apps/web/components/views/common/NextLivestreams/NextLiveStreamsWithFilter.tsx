import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { LIVESTREAM_REPLICAS } from "@careerfairy/shared-lib/livestreams/search"
import { queryParamToArr } from "@careerfairy/shared-lib/utils"
import {
   Box,
   Button,
   Card,
   CircularProgress,
   Container,
   Divider,
   Grid,
   Typography,
} from "@mui/material"
import {
   FilterOptions,
   useLivestreamSearchAlgolia,
} from "components/custom-hook/live-stream/useLivestreamSearchAlgolia"
import { useRecentPastLivestreams } from "components/custom-hook/live-stream/useRecentPastLivestreams"
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
import GroupStreams from "./GroupStreams/GroupStreams"
import NoResultsMessage from "./NoResultsMessage"
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
   recentStreamsSection: {
      mt: 4,
      px: { xs: 2, md: 3 },
   },
   divider: {
      my: 3,
      borderColor: (theme) => theme.palette.neutral[100],
   },
   recentStreamsTitle: {
      mb: 2,
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[800],
   },
   moreToWatchButton: {
      mt: 3,
      width: "100%",
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      color: (theme) => theme.palette.neutral[600],
      backgroundColor: "transparent",
      textTransform: "none",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.neutral[50],
      },
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

   // Fetch recent past livestreams for the new section
   const { data: recentPastLivestreams } = useRecentPastLivestreams({ limit: 9 })

   // Check if we should show the recent live streams section
   const shouldShowRecentStreams = useMemo(() => {
      return (
         initialTabValue === "upcomingEvents" &&
         infiniteLivestreams.length < 6 &&
         !hasAppliedFilters &&
         !inputValue &&
         recentPastLivestreams?.length > 0
      )
   }, [
      initialTabValue,
      infiniteLivestreams.length,
      hasAppliedFilters,
      inputValue,
      recentPastLivestreams?.length,
   ])

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
            minimumUpcomingStreams={hasAppliedFilters || inputValue ? 0 : 4}
            noResultsComponent={<NoResultsMessage message={noResultsMessage} />}
         />

         {shouldShowRecentStreams && (
            <Container maxWidth="xl" disableGutters>
               <Box sx={styles.recentStreamsSection}>
                  <Divider sx={styles.divider} />
                  <Typography variant="h6" sx={styles.recentStreamsTitle}>
                     Recent live streams
                  </Typography>
                  <GroupStreams
                     groupData={{}}
                     livestreams={recentPastLivestreams}
                     mobile={isMobile}
                     searching={false}
                     listenToUpcoming={false}
                     isPastLivestreams={true}
                  />
                  <Button
                     component={Link}
                     href="/past-livestreams"
                     variant="outlined"
                     endIcon={<ChevronRightIcon />}
                     sx={styles.moreToWatchButton}
                  >
                     More to watch
                  </Button>
               </Box>
            </Container>
         )}

         {Boolean(isValidating) && (
            <Box sx={styles.loader}>
               <CircularProgress />
            </Box>
         )}
         <Box ref={ref} />
      </>
   )
}

export default NextLiveStreamsWithFilter
