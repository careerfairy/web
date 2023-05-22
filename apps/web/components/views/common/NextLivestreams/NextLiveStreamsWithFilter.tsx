import useListenToStreams from "../../../../components/custom-hook/useListenToStreams"
import React, { useCallback, useMemo } from "react"
import { StreamsSection } from "./StreamsSection"
import { useRouter } from "next/router"
import { Box, Card, Container, Grid, Typography } from "@mui/material"
import Link from "../../../../components/views/common/Link"
import useIsMobile from "../../../../components/custom-hook/useIsMobile"
import { sxStyles } from "../../../../types/commonTypes"
import { Search as FindIcon } from "react-feather"
import LivestreamSearch, {
   LivestreamHit,
} from "../../group/admin/common/LivestreamSearch"
import Filter, { FilterEnum } from "../filter/Filter"
import { wishListBorderRadius } from "../../../../constants/pages"
import NoResultsMessage from "./NoResultsMessage"
import { useFieldsOfStudy } from "../../../custom-hook/useCollection"
import { buildDialogLink } from "../../livestream-dialog"

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

const getQueryVariables = (query) => {
   const languages = query.languages as string
   const companyCountries = query.companyCountries as string
   const companyIndustries = query.companyIndustries as string
   const fieldsOfStudy = query.fieldsOfStudy as string
   const recordedOnly = query.recordedOnly as string

   return {
      languages: languages && languages.split(","),
      companyCountries: companyCountries && companyCountries.split(","),
      companyIndustries:
         companyIndustries?.length && companyIndustries.split(","),
      fieldsOfStudy: fieldsOfStudy?.length && fieldsOfStudy.split(","),
      recordedOnly: recordedOnly?.toLowerCase() === "true" || false,
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
   const { data: allFieldsOfStudy } = useFieldsOfStudy()
   const {
      languages,
      companyCountries,
      companyIndustries,
      recordedOnly,
      fieldsOfStudy,
   } = useMemo(() => getQueryVariables(query), [query])
   const isMobile = useIsMobile()
   const hasPastEvents = useMemo(
      () => initialTabValue === "pastEvents",
      [initialTabValue]
   )

   const filtersToShow = useMemo(
      () => [
         hasPastEvents ? FilterEnum.recordedOnly : null,
         FilterEnum.languages,
         FilterEnum.companyCountries,
         FilterEnum.companyIndustries,
         FilterEnum.fieldsOfStudy,
      ],
      [hasPastEvents]
   )

   const mapFieldsOfStudy = useMemo(
      () =>
         allFieldsOfStudy?.filter((item) => fieldsOfStudy?.includes(item.id)),
      [allFieldsOfStudy, fieldsOfStudy]
   )

   const livestreams = useListenToStreams({
      languagesIds: languages,
      companyCountriesIds: companyCountries,
      companyIndustriesIds: companyIndustries,
      fieldsOfStudy: mapFieldsOfStudy,
      recordedOnly: recordedOnly,
      listenToPastEvents: hasPastEvents,
   })

   const noResultsMessage = useMemo<JSX.Element>(
      () => (
         <Grid xs={12} mt={4} mx={1} item>
            <Typography sx={styles.noResultsMessage} variant="h5">
               {/* eslint-disable-next-line react/no-unescaped-entities */}
               We didn't find any events matching your criteria. 😕{" "}
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
         <Container
            maxWidth="xl"
            disableGutters
            sx={{ flex: 1, display: "flex" }}
         >
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
