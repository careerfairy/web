import React from "react"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import NextLiveStreamsWithFilter from "../../components/views/common/NextLivestreams/NextLiveStreamsWithFilter"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const NextLivestreamsPage = () => {
   return (
      <>
         <SEO
            id={"CareerFairy | Upcoming Livestreams"}
            description={"CareerFairy | Upcoming Livestreams"}
            title={"CareerFairy | Upcoming Livestreams"}
         />
         <GenericDashboardLayout pageDisplayName={"Live streams"}>
            <NextLiveStreamsWithFilter initialTabValue={"upcomingEvents"} />
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

export default NextLivestreamsPage
