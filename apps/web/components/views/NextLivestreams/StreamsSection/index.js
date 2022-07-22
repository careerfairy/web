import { SwipeablePanel } from "../../../../materialUI/GlobalPanels/GlobalPanels"
import { isLoaded } from "react-redux-firebase"
import NextLivestreams from "../NextLivestreams"
import { Box, CircularProgress } from "@mui/material"
import * as PropTypes from "prop-types"
import React, { useEffect } from "react"
import { forceCheck } from "react-lazyload"

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
}) {
   useEffect(() => {
      forceCheck()
   }, [value])
   return (
      <Box sx={styles.wrapper}>
         <SwipeablePanel value={value} index={"upcomingEvents"}>
            {isLoaded(upcomingLivestreams) ? (
               <NextLivestreams
                  listenToUpcoming={listenToUpcoming}
                  livestreams={upcomingLivestreams || []}
                  currentGroup={currentGroup}
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
   dir: PropTypes.any,
   upcomingLivestreams: PropTypes.arrayOf(PropTypes.any),
   setSelectedOptions: PropTypes.func,
   selectedOptions: PropTypes.arrayOf(PropTypes.any),
   currentGroup: PropTypes.any,
   pastLivestreams: PropTypes.any,
}
