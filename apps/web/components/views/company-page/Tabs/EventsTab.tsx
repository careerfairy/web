import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Box, Grid } from "@mui/material"
import { EmptyItemsView } from "components/views/common/EmptyItemsView"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { ReactNode } from "react"
import { Radio, Video } from "react-feather"
import { useCompanyPage } from ".."

type Props = {
   events: LivestreamEvent[]
   title: string
   description: string
   icon?: ReactNode
}

const EventsTab = ({ events, title, description, icon }: Props) => {
   if (!events?.length) {
      return (
         <EmptyItemsView title={title} description={description} icon={icon} />
      )
   }

   return (
      <Box>
         <Grid container spacing={2}>
            {events?.map((event, index, arr) => (
               <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={event.id}>
                  <EventPreviewCard
                     index={index}
                     totalElements={arr.length}
                     event={event}
                  />
               </Grid>
            ))}
         </Grid>
      </Box>
   )
}
const EMPTY_PAST_EVENTS_TITLE = "There are no recordings available"
const EMPTY_PAST_EVENTS_DESCRIPTION =
   "Make sure to follow the company to receive their updates on upcoming live streams and new recordings when available!"

const EMPTY_UPCOMING_EVENTS_TITLE = "There are no upcoming live streams"
const EMPTY_UPCOMING_EVENTS_DESCRIPTION =
   "Make sure to follow the company to receive their updates on upcoming live streams!"

export const PastEventsTab = () => {
   const { pastLivestreams } = useCompanyPage()
   return (
      <EventsTab
         events={pastLivestreams}
         title={EMPTY_PAST_EVENTS_TITLE}
         description={EMPTY_PAST_EVENTS_DESCRIPTION}
         icon={<Video width={"44px"} height={"44px"} />}
      />
   )
}

export const UpcomingEventsTab = () => {
   const { upcomingLivestreams } = useCompanyPage()
   return (
      <EventsTab
         events={upcomingLivestreams}
         title={EMPTY_UPCOMING_EVENTS_TITLE}
         description={EMPTY_UPCOMING_EVENTS_DESCRIPTION}
         icon={<Radio width={"44px"} height={"44px"} />}
      />
   )
}
