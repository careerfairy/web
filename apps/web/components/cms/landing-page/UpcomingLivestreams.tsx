import { sxStyles } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import { EventsTypes } from "../../views/portal/events-preview/EventsPreview"
import EventsPreviewGrid from "../../views/portal/events-preview/EventsPreviewGrid"
import React, { useEffect, useState } from "react"
import { livestreamRepo } from "../../../data/RepositoryInstances"
import { LivestreamEvent } from "@careerfairy/shared-lib/src/livestreams"

const styles = sxStyles({
   wrapper: {
      marginTop: 6,
      marginBottom: 6,
   },
})

type Props = {
   fieldsOfStudy: string[]
}

const UpcomingLivestreams = ({ fieldsOfStudy }: Props) => {
   const [events, setEvents] = useState<LivestreamEvent[]>([])

   useEffect(() => {
      livestreamRepo
         .getUpcomingEventsByFieldsOfStudy(fieldsOfStudy, 10)
         .then((events: LivestreamEvent[]) => {
            if (events) {
               setEvents(events)
            }
         })
   }, [fieldsOfStudy])

   return (
      <Box sx={styles.wrapper}>
         <EventsPreviewGrid
            id={"upcoming-events"}
            title={"COMING UP NEXT"}
            type={EventsTypes.comingUp}
            seeMoreLink={"/next-livestreams"}
            loading={false}
            isOnLandingPage={true}
            events={events}
         />
      </Box>
   )
}

export default UpcomingLivestreams
