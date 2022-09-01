import React, { useEffect, useRef, useState } from "react"
import { Container, Grid } from "@mui/material"

import makeStyles from "@mui/styles/makeStyles"
import LatestEvents from "../common/LatestEvents"
import FeedbackTable from "./FeedbackTable"
import RatingSideTable from "./RatingSideTable"

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.background.dark,
      minHeight: "100%",
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(3),
      width: "100%",
   },
}))
const Feedback = ({
   group,
   globalTimeFrame,
   futureStreams,
   loading,
   userType,
   setUserType,
   userTypes,
   streamDataTypes,
   streamsFromTimeFrame,
   fetchingPolls,
   fetchingQuestions,
   fetchingRatings,
   handleScrollToBreakdown,
   breakdownRef,
   streamDataType,
   setStreamDataType,
   handleToggleBar,
   currentStream,
   setCurrentStream,
   showBar,
}) => {
   const classes = useStyles()

   const [currentPoll, setCurrentPoll] = useState(null)
   const [currentRating, setCurrentRating] = useState(null)
   const sideRef = useRef(null)

   useEffect(() => {
      setCurrentPoll(null)
      setCurrentRating(null)
   }, [currentStream?.id])

   const isRating = () => {
      return Boolean(streamDataType.propertyName === "feedback")
   }

   const isFetching = () => {
      return Boolean(
         loading || fetchingRatings || fetchingQuestions || fetchingPolls
      )
   }

   const handleScrollToSideRef = () => {
      sideRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
   }

   return (
      <Container className={classes.root} maxWidth={false}>
         <Grid container spacing={3}>
            <Grid item lg={12} md={12} xl={12} xs={12}>
               <LatestEvents
                  timeFrames={globalTimeFrame.timeFrames}
                  setCurrentStream={setCurrentStream}
                  futureStreams={futureStreams}
                  currentStream={currentStream}
                  fetchingStreams={loading}
                  streamsFromTimeFrame={streamsFromTimeFrame}
                  userType={userType}
                  userTypes={userTypes}
                  isFeedback
                  handleScrollToBreakdown={handleScrollToBreakdown}
                  handleToggleBar={handleToggleBar}
                  showBar={showBar}
                  setUserType={setUserType}
                  group={group}
               />
            </Grid>
            <Grid item lg={12} md={12} xl={12} xs={12}>
               <FeedbackTable
                  typesOfOptions={[]}
                  userTypes={userTypes}
                  setUserType={setUserType}
                  currentStream={currentStream}
                  fetchingStreams={isFetching()}
                  streamDataType={streamDataType}
                  setStreamDataType={setStreamDataType}
                  setCurrentRating={setCurrentRating}
                  currentPoll={currentPoll}
                  breakdownRef={breakdownRef}
                  setCurrentStream={setCurrentStream}
                  currentRating={currentRating}
                  handleScrollToSideRef={handleScrollToSideRef}
                  setCurrentPoll={setCurrentPoll}
                  streamDataTypes={streamDataTypes}
                  userType={userType}
                  group={group}
               />
            </Grid>
            <Grid item lg={12} md={12} xl={6} xs={12}>
               {isRating() && (
                  <RatingSideTable
                     streamDataType={streamDataType}
                     fetchingStreams={loading}
                     sideRef={sideRef}
                     currentRating={currentRating}
                  />
               )}
            </Grid>
         </Grid>
      </Container>
   )
}

export default Feedback
