import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import EventsPreview, {
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreview"
import { InferGetServerSidePropsType } from "next"
import { useMemo } from "react"
import { mapFromServerSide } from "util/serverUtil"
import { livestreamRepo } from "../../data/RepositoryInstances"

const CARDS_NUM = 9

{
   /* <iframe frameBorder="0" height="380" width="100%" src="http://www.careerfairy.io/next-livestreams/embed" title="Events"/> */
}

const EmbeddedUpcomingLivestreamsPage = ({
   serverSideUpcomingEvents,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const livestreamDocs = useMemo(() => {
      return mapFromServerSide(serverSideUpcomingEvents)
   }, [serverSideUpcomingEvents])

   return (
      <EventsPreview
         id={"upcoming-events"}
         limit={CARDS_NUM}
         title={"COMING UP NEXT"}
         type={EventsTypes.comingUp}
         events={livestreamDocs}
         isEmbedded
         // No need to show loading as these events have already been queried server side
         loading={false}
      />
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
