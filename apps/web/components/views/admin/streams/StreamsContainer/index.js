import React from "react"
import { CircularProgress, Grid } from "@mui/material"
import StreamCard from "./StreamCard"
import { isEmpty, isLoaded } from "react-redux-firebase"
import PropTypes from "prop-types"
import { useSelector } from "react-redux"

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
               <StreamCard isUpcoming={isUpcoming} stream={stream} />
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
