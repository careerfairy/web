import { CircularProgress, Grid } from "@mui/material"
import PropTypes from "prop-types"
import React from "react"
import { InView } from "react-intersection-observer"
import { useSelector } from "react-redux"
import { isEmpty, isLoaded } from "react-redux-firebase"
import StreamCard from "./StreamCard"

const StreamsContainer = ({ isUpcoming, streams }) => {
   const drawerOpen = useSelector(
      (state) => state.generalLayout.layout.drawerOpen
   )

   if (!isLoaded(streams)) {
      return <CircularProgress />
   }

   if (isEmpty(streams)) {
      return <span>No streams found</span>
   }

   return (
      <React.Fragment>
         {streams.map((stream) => (
            <Grid
               key={stream.id || new Date()}
               item
               xs={12}
               sm={6}
               md={drawerOpen ? 6 : 4}
               lg={4}
               xl={3}
            >
               <InView triggerOnce threshold={0.1} rootMargin="100px 0px">
                  {({ inView, ref }) => (
                     <StreamCard
                        ref={ref}
                        isUpcoming={isUpcoming}
                        stream={stream}
                        inView={inView}
                     />
                  )}
               </InView>
            </Grid>
         ))}
      </React.Fragment>
   )
}

StreamsContainer.propTypes = {
   streams: PropTypes.arrayOf(PropTypes.object).isRequired,
   isUpcoming: PropTypes.bool,
}

export default StreamsContainer
