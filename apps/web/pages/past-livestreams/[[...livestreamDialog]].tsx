import { InferGetServerSidePropsType, NextPage } from "next"
import SEO from "../../components/util/SEO"
import NextLiveStreamsWithFilter from "../../components/views/common/NextLivestreams/NextLiveStreamsWithFilter"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import {
   LivestreamDialogLayout,
   livestreamDialogSSP,
} from "../../components/views/livestream-dialog"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"

const PastLivestreamsPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
   return (
      <GenericDashboardLayout pageDisplayName={"Recordings"}>
         <LivestreamDialogLayout
            livestreamDialogData={props.livestreamDialogData}
         >
            <SEO
               id={"CareerFairy | Past Livestreams"}
               description={"Catch the past streams on CareerFairy."}
               title={"CareerFairy | Past Livestreams"}
            />
            <NextLiveStreamsWithFilter initialTabValue={"pastEvents"} />
            <ScrollToTop hasBottomNavBar />
         </LivestreamDialogLayout>
      </GenericDashboardLayout>
   )
}

export const getServerSideProps = livestreamDialogSSP()
export default PastLivestreamsPage
