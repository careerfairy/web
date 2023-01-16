import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout"
import React from "react"
import HeadWithMeta from "../../components/page/HeadWithMeta"
import {
   NEXT_LIVESTREAMS_PATH,
   PRODUCTION_BASE_URL,
} from "../../constants/routes"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import NextLiveStreamsWithFilter from "../../components/views/common/NextLivestreams/NextLiveStreamsWithFilter"

const pageMetadata = {
   description: "Catch the upcoming streams on CareerFairy.",
   title: `CareerFairy | Upcoming Livestreams`,
   image: "https://careerfairy.io/logo_teal.png",
   fullPath: `${PRODUCTION_BASE_URL}}${NEXT_LIVESTREAMS_PATH}`,
}

const NextLivestreamsPage = ({ initialTabValue }) => {
   return (
      <React.Fragment>
         <HeadWithMeta {...pageMetadata} />
         <NextLivestreamsLayout>
            <NextLiveStreamsWithFilter initialTabValue={initialTabValue} />
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

export default NextLivestreamsPage
