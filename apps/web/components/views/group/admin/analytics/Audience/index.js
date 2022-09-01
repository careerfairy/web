import React, { useMemo } from "react"
import { Container, Grid } from "@mui/material"

import makeStyles from "@mui/styles/makeStyles"
import LatestEvents from "../common/LatestEvents"
import UsersTable from "./UsersTable"
import { getUniqueUsersByEmailWithArrayOfUsers } from "../../../../../../data/util/AnalyticsUtil"

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: theme.palette.background.dark,
      minHeight: "100%",
      paddingBottom: theme.spacing(3),
      paddingTop: theme.spacing(3),
      width: "100%",
   },
}))
const Audience = ({
   group,
   globalTimeFrame,
   futureStreams,
   loading,
   isFollowers,
   userType,
   setUserType,
   limitedUserTypes,
   streamsFromTimeFrame,
   currentUserDataSet,
   handleReset,
   streamsFromTimeFrameAndFuture,
   handleToggleBar,
   breakdownRef,
   setCurrentStream,
   handleScrollToBreakdown,
   currentStream,
   showBar,
}) => {
   const classes = useStyles()
   const getUsers = () => {
      if (currentStream) {
         const updatedStream = streamsFromTimeFrameAndFuture.find(
            (stream) => stream.id === currentStream.id
         )
         return (
            updatedStream?.[userType.propertyDataName] ||
            currentStream[userType.propertyDataName]
         )
      } else {
         const totalViewers = streamsFromTimeFrameAndFuture.reduce(
            (accumulator, livestream) => {
               return livestream?.[userType.propertyDataName]
                  ? accumulator.concat(livestream[userType.propertyDataName])
                  : accumulator
            },
            []
         )
         return getUniqueUsersByEmailWithArrayOfUsers(totalViewers)
      }
   }
   const totalUniqueUsers = useMemo(
      () => getUsers(),
      [streamsFromTimeFrameAndFuture, currentStream, userType]
   )

   return (
      <Container className={classes.root} maxWidth={false}>
         <Grid container spacing={3}>
            <Grid item xs={12}>
               <LatestEvents
                  timeFrames={globalTimeFrame.timeFrames}
                  setCurrentStream={setCurrentStream}
                  futureStreams={futureStreams}
                  fetchingStreams={loading}
                  streamsFromTimeFrame={streamsFromTimeFrame}
                  userType={userType}
                  userTypes={limitedUserTypes}
                  currentStream={currentStream}
                  handleToggleBar={handleToggleBar}
                  showBar={showBar}
                  handleScrollToBreakdown={handleScrollToBreakdown}
                  setUserType={setUserType}
                  group={group}
               />
            </Grid>
            <Grid item xs={12}>
               <UsersTable
                  totalUniqueUsers={totalUniqueUsers}
                  currentStream={currentStream}
                  fetchingStreams={loading}
                  userTypes={limitedUserTypes}
                  handleReset={handleReset}
                  currentUserDataSet={currentUserDataSet}
                  setUserType={setUserType}
                  isFollowers={isFollowers}
                  breakdownRef={breakdownRef}
                  futureStreams={futureStreams}
                  streamsFromTimeFrameAndFuture={streamsFromTimeFrameAndFuture}
                  userType={userType}
                  group={group}
               />
            </Grid>
         </Grid>
      </Container>
   )
}

export default Audience
