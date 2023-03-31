import useListenToUpcomingStreams from "../../../../components/custom-hook/useListenToUpcomingStreams"
import NextLivestreamsBannerSection from "../../../../components/views/common/NextLivestreams/NextLivestreamsBannerSection"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useTheme } from "@mui/material/styles"
import { StreamsSection } from "./StreamsSection"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { useRouter } from "next/router"
import { Grid, Typography } from "@mui/material"
import Image from "next/image"
import Link from "../../../../components/views/common/Link"
import useIsMobile from "../../../../components/custom-hook/useIsMobile"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   noResultsMessage: {
      maxWidth: "800px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
      textAlign: "center",
   },
})

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
      companyIndustries: companyIndustries && companyIndustries.split(","),
   }
}

type Props = {
   initialTabValue?: "upcomingEvents" | "pastEvents"
}
const NextLiveStreamsWithFilter = ({
   initialTabValue = "upcomingEvents",
}: Props) => {
   const {
      palette: {
         common: { white },
      },
   } = useTheme()
   const { query } = useRouter()
   const [value, setValue] = useState(initialTabValue || "upcomingEvents")
   const {
      languages,
      interests,
      jobCheck,
      companyCountries,
      companySizes,
      companyIndustries,
   } = useMemo(() => getQueryVariables(query), [query])
   const isMobile = useIsMobile()

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
      if (value === "pastEvents" && !pastLivestreams) {
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
   }, [value, pastLivestreams])

   const handleChange = useCallback((event, newValue) => {
      if (newValue) {
         setValue(newValue)
      }
   }, [])

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

   return (
      <React.Fragment>
         <NextLivestreamsBannerSection
            color={white}
            handleChange={handleChange}
            value={value}
         />
         <StreamsSection
            value={value}
            upcomingLivestreams={upcomingLivestreams}
            listenToUpcoming
            pastLivestreams={pastLivestreams}
            minimumUpcomingStreams={0}
            noResultsComponent={renderNoResults()}
         />
      </React.Fragment>
   )
}

export default NextLiveStreamsWithFilter
