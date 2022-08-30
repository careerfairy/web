import { sxStyles } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import { EventsTypes } from "../../views/portal/events-preview/EventsPreview"
import EventsPreviewGrid from "../../views/portal/events-preview/EventsPreviewGrid"
import React from "react"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/marketing/MarketingUser"
import useUpcomingStreamsByFieldOfStudy from "../../custom-hook/useUpcomingStreamsByFieldOfStudy"

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
   const { events, loading } = useUpcomingStreamsByFieldOfStudy(fieldsOfStudy)

   return (
      <Box sx={styles.wrapper}>
         <EventsPreviewGrid
            id={"upcoming-events"}
            title={"COMING UP NEXT"}
            type={EventsTypes.comingUp}
            seeMoreLink={"/next-livestreams"}
            loading={loading}
            events={events}
         />
      </Box>
   )
}

export default UpcomingLivestreams
