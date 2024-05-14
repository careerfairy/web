import { UPCOMING_STREAM_THRESHOLD_MILLISECONDS } from "@careerfairy/shared-lib/livestreams/constants"
import { CircularProgress, Container, Grid, Typography } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import PropTypes from "prop-types"
import React, { Fragment, useMemo } from "react"
import { useSelector } from "react-redux"
import { isEmpty, isLoaded, useFirestoreConnect } from "react-redux-firebase"
import StreamsContainer from "./StreamsContainer"

const useStyles = makeStyles((theme) => ({
   root: {
      height: "inherit",
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      display: "flex",
      flexDirection: "column",
   },
   streamCard: {},
   highlighted: {},
}))

const AdminStreams = ({ typeOfStream }) => {
   const classes = useStyles()

   const query = useMemo(
      () => [
         {
            collection: "livestreams",
            where: [
               [
                  "start",
                  typeOfStream === "upcoming" ? ">" : "<",
                  new Date(Date.now() - UPCOMING_STREAM_THRESHOLD_MILLISECONDS),
               ],
               ["test", "==", false],
            ],
            orderBy: ["start", typeOfStream === "upcoming" ? "asc" : "desc"],
            limit: 150,
            storeAs: `${typeOfStream}-livestreams`,
         },
      ],
      [typeOfStream]
   )

   useFirestoreConnect(query)

   const streams = useSelector(
      (state) => state.firestore.ordered[`${typeOfStream}-livestreams`]
   )

   return (
      <Fragment>
         <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={2}>
               {/*<Grid item xs={12}>*/}
               {/*   <Search />*/}
               {/*</Grid>*/}
               <Grid item xs={12}>
                  <Grid container spacing={2}>
                     {!isLoaded(streams) ? (
                        <Grid item xs={12}>
                           <CircularProgress />
                        </Grid>
                     ) : isEmpty(streams) ? (
                        <Grid item xs={12}>
                           <Typography>No upcoming streams...</Typography>
                        </Grid>
                     ) : (
                        <StreamsContainer
                           isUpcoming={typeOfStream === "upcoming"}
                           streams={streams}
                        />
                     )}
                  </Grid>
               </Grid>
            </Grid>
         </Container>
      </Fragment>
   )
}

AdminStreams.propTypes = {
   typeOfStream: PropTypes.oneOf(["upcoming", "past"]),
}

export default AdminStreams
