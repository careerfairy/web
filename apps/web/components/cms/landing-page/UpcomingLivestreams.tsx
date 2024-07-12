import { FieldOfStudy } from "@careerfairy/shared-lib/marketing/MarketingUser"
import Box from "@mui/material/Box"
import { HygraphResponseEventsSection } from "../../../types/cmsTypes"
import { sxStyles } from "../../../types/commonTypes"
import useUpcomingStreamsByFieldOfStudy from "../../custom-hook/useUpcomingStreamsByFieldOfStudy"
import EventsPreview, {
   EventsTypes,
} from "../../views/portal/events-preview/EventsPreview"

const styles = sxStyles({
   wrapper: {
      px: { xs: 2, lg: 12 },
      paddingY: 6,
   },
})

type Props = {
   fieldsOfStudy: FieldOfStudy[]
} & HygraphResponseEventsSection

const UpcomingLivestreams = ({ fieldsOfStudy, eventsTitle }: Props) => {
   const { events, loading } = useUpcomingStreamsByFieldOfStudy(
      fieldsOfStudy,
      true
   )

   return (
      <Box sx={styles.wrapper}>
         <EventsPreview
            id={"upcoming-events"}
            title={eventsTitle || "COMING UP NEXT"}
            type={EventsTypes.comingUpMarketing}
            events={events}
            loading={loading || (!loading && !events.length)}
            isEmpty={events.length === 0}
         />
      </Box>
   )
}

export default UpcomingLivestreams
