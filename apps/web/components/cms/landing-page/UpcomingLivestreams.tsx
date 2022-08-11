import { sxStyles } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import { EventsTypes } from "../../views/portal/events-preview/EventsPreview"
import EventsPreviewGrid from "../../views/portal/events-preview/EventsPreviewGrid"
import React, { useEffect, useState } from "react"
import { livestreamRepo } from "../../../data/RepositoryInstances"
import { LivestreamEvent } from "@careerfairy/shared-lib/src/livestreams"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/marketing/MarketingUser"

const styles = sxStyles({
   wrapper: {
      marginTop: 6,
      marginBottom: 6,
   },
})

type Props = {
   fieldsOfStudy: FieldOfStudy[]
}

const UpcomingLivestreams = ({ fieldsOfStudy }: Props) => {
   const [events, setEvents] = useState<LivestreamEvent[]>([])

   useEffect(() => {
      livestreamRepo
         .getUpcomingEventsByFieldsOfStudy(
            fieldsOfStudy.map((el) => el.id),
            10
         )
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
            events={events}
         />
      </Box>
   )
}

export default UpcomingLivestreams
