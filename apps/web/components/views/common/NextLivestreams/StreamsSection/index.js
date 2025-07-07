import { Box, CircularProgress } from "@mui/material"
import * as PropTypes from "prop-types"
import { isLoaded } from "react-redux-firebase"
import { SwipeablePanel } from "../../../../../materialUI/GlobalPanels/GlobalPanels"
import { formatLivestreamsEvents } from "../../../portal/events-preview/utils"
import NextLivestreams from "../NextLivestreams"

const styles = {
   loaderWrapper: {
      display: "grid",
      width: "100%",
      height: "40vh",
      placeItems: "center",
   },
   wrapper: {
      minHeight: "80vh",
   },
}

export function StreamsSection({
   currentGroup,
   pastLivestreams,
   upcomingLivestreams,
   listenToUpcoming,
   value,
   minimumUpcomingStreams = 6,
   noResultsComponent,
}) {
   // Calculate the actual minimum to pass based on the number of upcoming livestreams
   const actualMinimum = upcomingLivestreams?.length < 4 ? 0 : minimumUpcomingStreams

   return (
      <Box sx={styles.wrapper}>
         <SwipeablePanel value={value} index={"upcomingEvents"}>
            {isLoaded(upcomingLivestreams) ? (
               <NextLivestreams
                  listenToUpcoming={listenToUpcoming}
                  livestreams={formatLivestreamsEvents(
                     upcomingLivestreams,
                     actualMinimum
                  )}
                  currentGroup={currentGroup}
                  noResultsComponent={noResultsComponent}
               />
            ) : (
               <Box sx={styles.loaderWrapper}>
                  <CircularProgress color="primary" />
               </Box>
            )}
         </SwipeablePanel>
         <SwipeablePanel value={value} index={"pastEvents"}>
            {isLoaded(pastLivestreams) ? (
               <NextLivestreams
                  listenToUpcoming={listenToUpcoming}
                  isPastLivestreams
                  livestreams={pastLivestreams || []}
                  currentGroup={currentGroup}
                  noResultsComponent={noResultsComponent}
               />
            ) : (
               <Box sx={styles.loaderWrapper}>
                  <CircularProgress color="primary" />
               </Box>
            )}
         </SwipeablePanel>
      </Box>
   )
}

StreamsSection.propTypes = {
   value: PropTypes.string.isRequired,
   upcomingLivestreams: PropTypes.arrayOf(PropTypes.any),
   currentGroup: PropTypes.any,
   pastLivestreams: PropTypes.any,
   minimumUpcomingStreams: PropTypes.number,
   noResultsComponent: PropTypes.element,
}
