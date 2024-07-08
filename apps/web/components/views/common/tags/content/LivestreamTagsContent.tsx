import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { Box, Button, Grid, Stack, Typography } from "@mui/material"
import { useLivestreamsByTags } from "components/custom-hook/tags/useLivestreamsByTags"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChevronDown } from "react-feather"
import { sxStyles } from "types/commonTypes"
import EventPreviewCard from "../../stream-cards/EventPreviewCard"

const EVENTS_PER_BATCH = 3

const styles = sxStyles({
   seeMore: {
      color: (theme) => theme.palette.neutral[600],
      borderRadius: "20px",
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      "&:hover": {
         backgroundColor: (theme) => theme.palette.neutral[200],
      },
      mx: "15px !important",
   },
   heading: {
      fontSize: "18px",
      pl: 2,
      fontWeight: 600,
   },
   eventsRowWrapper: {
      px: 2,
      flexWrap: "wrap",
   },
   slide: {
      position: "relative",
      maxWidth: "368px",
      ml: 2,
   },
})

type Props = {
   type: "future" | "past"
   tags: GroupedTags
   title: string
}

const LivestreamTagsContent = (props: Props) => {
   const {
      data: events,
      setSize: setNextPage,
      hasMorePages: hasMorePages,
   } = useLivestreamsByTags(props.type, props.tags, EVENTS_PER_BATCH)

   if (!events.length) return null

   return (
      <Stack>
         <Typography sx={styles.heading} color="neutral.800">
            {props.title}
         </Typography>
         <EventsPreview
            events={events}
            seeMoreDisabled={!hasMorePages}
            onSeeMore={() => setNextPage((previousSize) => previousSize + 1)}
         />
      </Stack>
   )
}

type EventsPreviewProps = {
   events: LivestreamEvent[]
   onSeeMore: () => void
   seeMoreDisabled?: boolean
}

const EventsPreview = ({
   events,
   seeMoreDisabled,
   onSeeMore,
}: EventsPreviewProps) => {
   const isMobile = useIsMobile()

   return (
      <Stack direction={"column"} sx={{ width: "100%" }} spacing={1}>
         <Box sx={{ p: { xs: 2, md: 2 }, width: "100%" }}>
            <Grid container spacing={isMobile ? 2 : 3}>
               {events.map((livestream, idx, arr) => {
                  return (
                     <Grid
                        key={livestream.id}
                        xs={12}
                        sm={6}
                        lg={4}
                        xl={3}
                        item
                     >
                        <EventPreviewCard
                           key={livestream.id}
                           index={idx}
                           totalElements={arr.length}
                           // TODO: Check location
                           location={
                              ImpressionLocation.recommendedEventsCarousel
                           }
                           event={livestream}
                           isRecommended
                        />
                     </Grid>
                  )
               })}
            </Grid>
         </Box>
         <Button
            disabled={seeMoreDisabled}
            onClick={onSeeMore}
            sx={[styles.seeMore]}
         >
            See more <ChevronDown />
         </Button>
      </Stack>
   )
}

export default LivestreamTagsContent
