import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Grid, Typography } from "@material-ui/core";
import { isEmpty, isLoaded } from "react-redux-firebase";
import EmbedStreamCard from "../../../common/stream-cards/EmbedStreamCard";
import useInfiniteScrollClientWithHandlers from "../../../../custom-hook/useInfiniteScrollClientWithHandlers";

const useStyles = makeStyles((theme) => ({
   streamsContainer: {
      padding: theme.spacing(2, 0),
   },
   loaderWrapper: {
      display: "grid",
      width: "100%",
      height: "40vh",
      placeItems: "center",
   },
}));

const Streams = (props) => {
   const { streams, currentGroup, isPast } = props;
   const classes = useStyles();
   const [slicedLivestreams] = useInfiniteScrollClientWithHandlers(
      streams,
      6,
      3
   );

   if (!isLoaded(streams)) {
      return (
         <div className={classes.loaderWrapper}>
            <CircularProgress color="primary" />
         </div>
      );
   }

   return (
      <Grid className={classes.streamsContainer} container spacing={2}>
         {isEmpty(streams) ? (
            <Grid item xs={12}>
               <Typography variant="h5" color="textSecondary" align="center">
                  {currentGroup.universityName} currently has no{" "}
                  {isPast ? "past" : "scheduled"} live streams
               </Typography>
            </Grid>
         ) : (
            slicedLivestreams.map((stream) => (
               <Grid key={stream.id} xs={12} md={6} lg={4} item>
                  <EmbedStreamCard
                     currentGroup={currentGroup}
                     isPast={isPast}
                     stream={stream}
                  />
               </Grid>
            ))
         )}
      </Grid>
   );
};

export default Streams;
