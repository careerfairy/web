import useListenToUpcomingStreams from "../../../../components/custom-hook/useListenToUpcomingStreams"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StreamsSection } from "./StreamsSection"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { useRouter } from "next/router"
import { Box, Card, Container, Grid, Typography } from "@mui/material"
import Image from "next/image"
import Link from "../../../../components/views/common/Link"
import useIsMobile from "../../../../components/custom-hook/useIsMobile"
import { sxStyles } from "../../../../types/commonTypes"
import { Search as FindIcon } from "react-feather"
import LivestreamSearch, {
   LivestreamHit,
} from "../../group/admin/common/LivestreamSearch"
import Filter, { FilterEnum } from "../filter/Filter"
import { wishListBorderRadius } from "../../../../constants/pages"

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

const filtersToShow = [
   FilterEnum.languages,
   FilterEnum.interests,
   FilterEnum.companyCountries,
   FilterEnum.companySizes,
   FilterEnum.companyIndustries,
]

const getQueryVariables = (query) => {
   const languages = query.languages as string
   const interests = query.interests as string
   const jobCheck = query.jobCheck as string
   const companyCountries = query.companyCountries as string
   const companySizes = query.companySizes as string
   const companyIndustries = query.companyIndustries as string

   return {
      languages: languages && languages.split(","),
      interests: interests && interests.split(","),
      jobCheck: jobCheck?.toLowerCase() === "true" || false,
      companyCountries: companyCountries && companyCountries.split(","),
      companySizes: companySizes && companySizes.split(","),
      companyIndustries:
         companyIndustries?.length && companyIndustries.split(","),
   }
}

type Props = {
   initialTabValue?: "upcomingEvents" | "pastEvents"
}
const NextLiveStreamsWithFilter = ({
   initialTabValue = "upcomingEvents",
}: Props) => {
   const { query, push } = useRouter()
   const {
      languages,
      interests,
      jobCheck,
      companyCountries,
      companySizes,
      companyIndustries,
   } = useMemo(() => getQueryVariables(query), [query])
   const isMobile = useIsMobile()
   const hasPastEvents = useMemo(
      () => initialTabValue === "pastEvents",
      [initialTabValue]
   )

   const upcomingLivestreams = useListenToUpcomingStreams({
      languagesIds: languages,
      interestsIds: interests,
      jobCheck: jobCheck,
      companyCountriesIds: companyCountries,
      companySizes: companySizes,
      companyIndustriesIds: companyIndustries,
   })
   const [pastLivestreams, setPastLivestreams] = useState(undefined)

   useEffect(() => {
      // load past events when changing tabs
      if (hasPastEvents && !pastLivestreams) {
         const sixMonthsAgo = new Date(
            new Date().setMonth(new Date().getMonth() - 6)
         )
         livestreamRepo
            .getPastEventsFrom({ fromDate: sixMonthsAgo })
            .then((data) => {
               setPastLivestreams(data)
            })
            .catch(console.error)
      }
   }, [hasPastEvents, pastLivestreams])

   const renderNoResults = useCallback(() => {
      return (
         <>
            <Grid xs={12} mt={{ xs: 12, md: 20 }} textAlign="center" item>
               <Image
                  src="/empty-search.svg"
                  width="600"
                  height="300"
                  alt="Empty search illustration"
               />
            </Grid>
            <Grid xs={12} mt={4} mx={1} item>
               <Typography sx={styles.noResultsMessage} variant="h5">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  We didn't find any events matching your criteria. 😕{" "}
                  {isMobile ? (
                     <Link href="/next-livestreams">clear all filters</Link>
                  ) : null}
               </Typography>
               {isMobile ? null : (
                  <Typography sx={styles.noResultsMessage} variant="h5">
                     Remove some filters or start anew by{" "}
                     <Link href="/next-livestreams">clearing all filters</Link>.
                  </Typography>
               )}
            </Grid>
         </>
      )
   }, [isMobile])

   // Clicking on a search result will open the detail page for the corresponding stream
   const handleSearch = useCallback(
      (hit: LivestreamHit | null) => {
         void push(`/upcoming-livestream/${hit.id}`)
      },
      [push]
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
               {hasPastEvents ? null : (
                  <Box sx={styles.filter}>
                     <Filter filtersToShow={filtersToShow} />
                  </Box>
               )}
            </Box>
         </Container>

         <StreamsSection
            value={initialTabValue}
            upcomingLivestreams={upcomingLivestreams}
            listenToUpcoming
            pastLivestreams={pastLivestreams}
            minimumUpcomingStreams={0}
            noResultsComponent={renderNoResults()}
         />
      </>
   )
}

export default NextLiveStreamsWithFilter
