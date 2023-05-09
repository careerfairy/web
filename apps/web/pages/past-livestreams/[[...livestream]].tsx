import NextLiveStreamsWithFilter from "../../components/views/common/NextLivestreams/NextLiveStreamsWithFilter"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import React from "react"
import SEO from "../../components/util/SEO"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import { InferGetServerSidePropsType, NextPage } from "next"
import {
   LivestreamDialogLayout,
   withLivestreamDialogData,
} from "../../components/views/livestream-dialog"

const PastLivestreamsPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
   return (
      <LivestreamDialogLayout serverSideLivestream={props.serverSideLivestream}>
         <SEO
            id={"CareerFairy | Past Livestreams"}
            description={"Catch the past streams on CareerFairy."}
            title={"CareerFairy | Past Livestreams"}
         />
         <GenericDashboardLayout pageDisplayName={"Past live streams"}>
            <NextLiveStreamsWithFilter initialTabValue={"pastEvents"} />
         </GenericDashboardLayout>
         <ScrollToTop hasBottomNavBar />
      </LivestreamDialogLayout>
   )
}

export const getServerSideProps = withLivestreamDialogData()
export default PastLivestreamsPage
