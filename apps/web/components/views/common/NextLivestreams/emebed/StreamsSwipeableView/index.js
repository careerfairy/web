import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { SwipeablePanel } from "../../../../../../materialUI/GlobalPanels/GlobalPanels"
import { Container } from "@mui/material"
import * as PropTypes from "prop-types"
import Streams from "./Streams"

const useStyles = makeStyles((theme) => ({
   wrapper: {
      minHeight: "80vh",
   },
}))

const StreamsSwipeableView = ({
   currentGroup,
   pastLivestreams,
   upcomingLivestreams,
   value,
}) => {
   const classes = useStyles()

   return (
      <Container className={classes.wrapper}>
         <SwipeablePanel value={value} index={"upcomingEvents"}>
            <Streams
               currentGroup={currentGroup}
               streams={upcomingLivestreams}
            />
         </SwipeablePanel>
         <SwipeablePanel value={value} index={"pastEvents"}>
            <Streams
               currentGroup={currentGroup}
               streams={pastLivestreams}
               isPast
            />
         </SwipeablePanel>
      </Container>
   )
}

StreamsSwipeableView.propTypes = {
   value: PropTypes.string.isRequired,
   dir: PropTypes.any,
   upcomingLivestreams: PropTypes.arrayOf(PropTypes.any),
   livestreamId: PropTypes.any,
   setSelectedOptions: PropTypes.func,
   selectedOptions: PropTypes.arrayOf(PropTypes.any),
   currentGroup: PropTypes.any,
   pastLivestreams: PropTypes.any,
}

export default StreamsSwipeableView
