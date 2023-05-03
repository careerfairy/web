import { SwipeablePanel } from "../../../../../materialUI/GlobalPanels/GlobalPanels"
import { isLoaded } from "react-redux-firebase"
import NextLivestreams from "../NextLivestreams"
import { Box, CircularProgress } from "@mui/material"
import * as PropTypes from "prop-types"
import React from "react"
import { formatLivestreamsEvents } from "../../../portal/events-preview/utils"

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
   return (
      <Box sx={styles.wrapper}>
         <SwipeablePanel value={value} index={"upcomingEvents"}>
            {isLoaded(upcomingLivestreams) ? (
               <NextLivestreams
                  listenToUpcoming={listenToUpcoming}
                  livestreams={formatLivestreamsEvents(
                     upcomingLivestreams,
                     minimumUpcomingStreams
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
