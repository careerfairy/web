import { Box, CircularProgress, Container } from "@mui/material"
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
      display: "flex",
      flexDirection: "column",
   },
   panelContainer: {
      flex: 1,
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
   showSeparator = false,
}) {
   return (
      <Box sx={styles.wrapper}>
         <SwipeablePanel 
            value={value} 
            index={"upcomingEvents"}
            sx={styles.panelContainer}
         >
            {isLoaded(upcomingLivestreams) ? (
               <>
                  <NextLivestreams
                     listenToUpcoming={listenToUpcoming}
                     livestreams={formatLivestreamsEvents(
                        upcomingLivestreams,
                        minimumUpcomingStreams
                     )}
                     currentGroup={currentGroup}
                     noResultsComponent={noResultsComponent}
                  />
                  {showSeparator ? (
                     <Container maxWidth="xl" disableGutters>
                        <Box
                           sx={{
                              height: "1px",
                              backgroundColor: "neutral.100",
                              width: "100%",
                              mt: 3, // 24px spacing from upcoming streams
                              mb: 3, // 24px spacing to recent streams
                           }}
                        />
                     </Container>
                  ) : null}
               </>
            ) : (
               <Box sx={styles.loaderWrapper}>
                  <CircularProgress color="primary" />
               </Box>
            )}
         </SwipeablePanel>
         <SwipeablePanel 
            value={value} 
            index={"pastEvents"}
            sx={styles.panelContainer}
         >
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
   showSeparator: PropTypes.bool,
}
