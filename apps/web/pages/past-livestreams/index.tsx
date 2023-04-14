import NextLiveStreamsWithFilter from "../../components/views/common/NextLivestreams/NextLiveStreamsWithFilter"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import React from "react"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const PastLivestreamsPage = () => {
   return (
      <>
         <SEO
            id={"CareerFairy | Past Livestreams"}
            description={"Catch the past streams on CareerFairy."}
            title={"CareerFairy | Past Livestreams"}
         />
         <GenericDashboardLayout pageDisplayName={"Past live streams"}>
            <NextLiveStreamsWithFilter initialTabValue={"pastEvents"} />
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </>
   )
}

export default PastLivestreamsPage
