import { sxStyles } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import EventsPreview, {
   EventsTypes,
} from "../../views/portal/events-preview/EventsPreview"
import React from "react"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/marketing/MarketingUser"
import useUpcomingStreamsByFieldOfStudy from "../../custom-hook/useUpcomingStreamsByFieldOfStudy"
import { HygraphResponseEventsSection } from "../../../types/cmsTypes"

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
            limit={0}
            title={eventsTitle?.toUpperCase() || "COMING UP NEXT"}
            type={EventsTypes.comingUp}
            events={events}
            loading={loading}
            isEmpty={events.length === 0}
         />
      </Box>
   )
}

export default UpcomingLivestreams
