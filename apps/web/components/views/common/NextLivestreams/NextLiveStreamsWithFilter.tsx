import { Box, Card, Container, Grid, Typography } from "@mui/material"
import useLivestreamsSWR, {
   UseLivestreamsSWROptions,
} from "components/custom-hook/live-stream/useLivestreamsSWR"
import { useRouter } from "next/router"
import { useCallback, useMemo } from "react"
import { Search as FindIcon } from "react-feather"
import useIsMobile from "../../../../components/custom-hook/useIsMobile"
import Link from "../../../../components/views/common/Link"
import { wishListBorderRadius } from "../../../../constants/pages"
import { sxStyles } from "../../../../types/commonTypes"
import { useFieldsOfStudy } from "../../../custom-hook/useCollection"
import LivestreamSearch, {
   LivestreamHit,
} from "../../group/admin/common/LivestreamSearch"
import { buildDialogLink } from "../../livestream-dialog"
import Filter, { FilterEnum } from "../filter/Filter"
import NoResultsMessage from "./NoResultsMessage"
import { StreamsSection } from "./StreamsSection"
import { ParsedUrlQuery } from "querystring"

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
})

const queryParamToArr = (
   queryParam: string | string[] | undefined
): string[] => {
   if (!queryParam) return []
   if (Array.isArray(queryParam)) return queryParam.sort()
   return queryParam.split(",").sort() // to make sure the order is always the same for caching the key
}

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

   const { data: allFieldsOfStudy, isLoading: isLoadingFieldsOfStudy } =
      useFieldsOfStudy()

   const {
      languages,
      companyCountries,
      companyIndustries,
      recordedOnly,
      fieldsOfStudy,
      companyId,
   } = useMemo(() => getQueryVariables(query), [query])
   const isMobile = useIsMobile()
   const hasPastEvents = useMemo(
      () => initialTabValue === "pastEvents",
      [initialTabValue]
   )

   const filtersToShow = useMemo(
      () => [
         companyId ? FilterEnum.companyId : null,
         hasPastEvents ? FilterEnum.recordedOnly : null,
         FilterEnum.languages,
         FilterEnum.companyCountries,
         FilterEnum.companyIndustries,
         FilterEnum.fieldsOfStudy,
      ],
      [companyId, hasPastEvents]
   )

   const mapFieldsOfStudy = useMemo(
      () =>
         allFieldsOfStudy?.filter((item) => fieldsOfStudy?.includes(item.id)),
      [allFieldsOfStudy, fieldsOfStudy]
   )

   const swrQuery = useMemo<UseLivestreamsSWROptions>(
      () => ({
         languageCodes: languages,
         companyCountries: companyCountries,
         companyIndustries: companyIndustries,
         targetFieldsOfStudy: mapFieldsOfStudy,
         withRecordings: recordedOnly,
         targetGroupId: companyId,
         withHidden: Boolean(companyId), // If we are filtering by company, we want to get all events, even if they are hidden
         type: initialTabValue,
         disabled: isLoadingFieldsOfStudy,
      }),
      [
         languages,
         companyCountries,
         companyIndustries,
         mapFieldsOfStudy,
         recordedOnly,
         companyId,
         initialTabValue,
         isLoadingFieldsOfStudy,
      ]
   )

   const { data: livestreams } = useLivestreamsSWR(swrQuery)

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
      (hit: LivestreamHit | null) => {
         if (!hit) return
         void push(
            buildDialogLink({
               router,
               link: {
                  type: "livestreamDetails",
                  livestreamId: hit.id,
               },
            }),
            undefined,
            {
               shallow: true,
               scroll: false,
            }
         )
      },
      [push, router]
   )

   return (
      <>
         <Container maxWidth="xl" disableGutters sx={{ display: "flex" }}>
            <Box sx={styles.root}>
               <Card sx={styles.search}>
                  <LivestreamSearch
                     orderByDirection={hasPastEvents ? "desc" : "asc"}
                     handleChange={handleSearch}
                     value={null}
                     endIcon={<FindIcon color={"black"} />}
                     searchWithTrigram
                     hasPastEvents={hasPastEvents}
                  />
               </Card>
               <Box sx={styles.filter}>
                  <Filter
                     filtersToShow={filtersToShow}
                     numberOfResults={livestreams?.length}
                  />
               </Box>
            </Box>
         </Container>

         <StreamsSection
            value={initialTabValue}
            upcomingLivestreams={livestreams}
            listenToUpcoming
            pastLivestreams={livestreams}
            minimumUpcomingStreams={0}
            noResultsComponent={<NoResultsMessage message={noResultsMessage} />}
         />
      </>
   )
}

export default NextLiveStreamsWithFilter
