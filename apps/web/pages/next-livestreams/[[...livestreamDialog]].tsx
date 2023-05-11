import React from "react"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import NextLiveStreamsWithFilter from "../../components/views/common/NextLivestreams/NextLiveStreamsWithFilter"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import { InferGetServerSidePropsType, NextPage } from "next"
import {
   LivestreamDialogLayout,
   withLivestreamDialogData,
} from "../../components/views/livestream-dialog"

const NextLivestreamsPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
   return (
      <LivestreamDialogLayout livestreamDialogData={props.livestreamDialogData}>
         <SEO
            id={"CareerFairy | Upcoming Livestreams"}
            description={"CareerFairy | Upcoming Livestreams"}
            title={"CareerFairy | Upcoming Livestreams"}
         />
         <GenericDashboardLayout pageDisplayName={"Live streams"}>
            <NextLiveStreamsWithFilter initialTabValue={"upcomingEvents"} />
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </LivestreamDialogLayout>
   )
}

export const getServerSideProps = withLivestreamDialogData()

export default NextLivestreamsPage
