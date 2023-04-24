import { livestreamRepo } from "../../data/RepositoryInstances"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { InferGetServerSidePropsType } from "next"
import { formatLivestreamsEvents } from "components/views/portal/events-preview/utils"
import EventsPreview, {
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreview"
import { useMemo } from "react"
import { mapFromServerSide } from "util/serverUtil"
import GlobalStyles from "@mui/material/GlobalStyles"

const CARDS_NUM = 9

{
   /* <iframe frameBorder="0" height="380" width="100%" src="http://www.careerfairy.io/next-livestreams/embed" title="Events"/> */
}

const styles = {
   body: {
      backgroundColor: "transparent",
   },
}

const EmbeddedUpcomingLivestreamsPage = ({
   serverSideUpcomingEvents,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const livestreamDocs = useMemo(() => {
      return mapFromServerSide(serverSideUpcomingEvents)
   }, [serverSideUpcomingEvents])

   return (
      <>
         <GlobalStyles styles={styles} />
         <EventsPreview
            id={"upcoming-events"}
            limit={CARDS_NUM}
            type={EventsTypes.comingUp}
            events={formatLivestreamsEvents(livestreamDocs)}
            isEmbedded
            // No need to show loading as these events have already been queried server side
            loading={false}
         />
      </>
   )
}

export async function getServerSideProps() {
   const numEvents = CARDS_NUM

   const upcomingEvents = await livestreamRepo
      .getUpcomingEvents(numEvents)
      .then((events) => events.map(LivestreamPresenter.serializeDocument))

   return {
      props: {
         serverSideUpcomingEvents: upcomingEvents,
      },
   }
}

export default EmbeddedUpcomingLivestreamsPage
