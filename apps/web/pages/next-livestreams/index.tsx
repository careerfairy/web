import { withFirebase } from "../../context/firebase/FirebaseServiceContext"
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout"
import useListenToUpcomingStreams from "../../components/custom-hook/useListenToUpcomingStreams"
import NextLivestreamsBannerSection from "../../components/views/NextLivestreams/NextLivestreamsBannerSection"
import React, { useCallback, useEffect, useState } from "react"
import { useTheme } from "@mui/material/styles"
import { StreamsSection } from "../../components/views/NextLivestreams/StreamsSection"
import HeadWithMeta from "../../components/page/HeadWithMeta"
import {
   NEXT_LIVESTREAMS_PATH,
   PRODUCTION_BASE_URL,
} from "../../constants/routes"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import { livestreamRepo } from "../../data/RepositoryInstances"

const pageMetadata = {
   description: "Catch the upcoming streams on CareerFairy.",
   title: `CareerFairy | Upcoming Livestreams`,
   image: "https://careerfairy.io/logo_teal.png",
   fullPath: `${PRODUCTION_BASE_URL}}${NEXT_LIVESTREAMS_PATH}`,
}

const NextLivestreamsPage = ({ initialTabValue }) => {
   const {
      palette: {
         common: { white },
      },
   } = useTheme()
   const [value, setValue] = useState(initialTabValue || "upcomingEvents")

   const upcomingLivestreams = useListenToUpcomingStreams()
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

export default withFirebase(NextLivestreamsPage)
