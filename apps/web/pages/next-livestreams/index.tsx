import { withFirebase } from "../../context/firebase/FirebaseServiceContext"
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout"
import useListenToUpcomingStreams from "../../components/custom-hook/useListenToUpcomingStreams"
import NextLivestreamsBannerSection from "../../components/views/NextLivestreams/NextLivestreamsBannerSection"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useTheme } from "@mui/material/styles"
import { StreamsSection } from "../../components/views/NextLivestreams/StreamsSection"
import HeadWithMeta from "../../components/page/HeadWithMeta"
import {
   NEXT_LIVESTREAMS_PATH,
   PRODUCTION_BASE_URL,
} from "../../constants/routes"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { useRouter } from "next/router"
import { Grid, Typography } from "@mui/material"
import Image from "next/image"
import Link from "../../components/views/common/Link"

const styles = {
   noResultsMessage: {
      maxWidth: "800px",
      margin: "0 auto",
      color: "rgb(130,130,130)",
      textAlign: "center",
   },
}

const pageMetadata = {
   description: "Catch the upcoming streams on CareerFairy.",
   title: `CareerFairy | Upcoming Livestreams`,
   image: "https://careerfairy.io/logo_teal.png",
   fullPath: `${PRODUCTION_BASE_URL}}${NEXT_LIVESTREAMS_PATH}`,
}

const getQueryVariables = (query) => {
   const languages = query.languages as string
   const interests = query.interests as string
   const jobCheck = query.jobCheck as string

   return {
      languages: languages && languages.split(","),
      interests: interests && interests.split(","),
      jobCheck: jobCheck?.toLowerCase() === "true" || false,
   }
}

const NextLivestreamsPage = ({ initialTabValue }) => {
   const {
      palette: {
         common: { white },
      },
   } = useTheme()
   const { query } = useRouter()
   const [value, setValue] = useState(initialTabValue || "upcomingEvents")
   const { languages, interests, jobCheck } = useMemo(
      () => getQueryVariables(query),
      [query]
   )

   const upcomingLivestreams = useListenToUpcomingStreams({
      languagesIds: languages,
      interestsIds: interests,
      jobCheck: jobCheck,
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
      setValue(newValue)
   }, [])

   return (
      <React.Fragment>
         <HeadWithMeta {...pageMetadata} />
         <NextLivestreamsLayout>
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
         </NextLivestreamsLayout>
         <ScrollToTop />
      </React.Fragment>
   )
}

export async function getServerSideProps({ query: { careerCenterId, type } }) {
   if (careerCenterId) {
      let destination = `/next-livestreams/${careerCenterId}`
      return {
         props: {},
         redirect: {
            destination: destination,
            permanent: false,
         },
      }
   }
   let initialTabValue = null
   if (type === "upcomingEvents" || type === "pastEvents") {
      initialTabValue = type
   }

   return {
      props: {
         initialTabValue,
      }, // will be passed to the page component as props
   }
}

const renderNoResults = () => {
   return (
      <Grid container mx={1}>
         <Grid xs={12} mt={20} textAlign="center" item>
            <Image
               src="/empty-search.svg"
               width="800"
               height="400"
               alt="Empty search illustration"
            />
         </Grid>
         <Grid xs={12} mt={4} item>
            <Typography sx={styles.noResultsMessage} variant="h5">
               {/* eslint-disable-next-line react/no-unescaped-entities */}
               We didn't find any events matching your criteria. Remove some
               filters or start anew by{" "}
               <Link href="/next-livestreams">clearing all filter</Link>. 😕
            </Typography>
         </Grid>
      </Grid>
   )
}
export default withFirebase(NextLivestreamsPage)
