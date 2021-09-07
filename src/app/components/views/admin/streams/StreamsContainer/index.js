import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Grid } from "@material-ui/core";
import StreamCard from "./StreamCard";
import { isEmpty, isLoaded } from "react-redux-firebase";
import { streamType } from "../../../../../types";

const useStyles = makeStyles((theme) => ({
   loader: {
      margin: "auto",
   },
}));

const StreamsContainer = ({ streams }) => {
   const classes = useStyles();

   if (!isLoaded(streams)) {
      return <CircularProgress />;
   }

   if (isEmpty(streams)) {
      return <span>No streams found</span>;
   }

   return (
      <React.Fragment>
         {streams.map((stream) => (
            <Grid
               key={stream.id || new Date()}
               item
               xs={12}
               sm={6}
               md={4}
               lg={4}
               xl={3}
            >
               <StreamCard stream={stream} />
            </Grid>
         ))}
      </React.Fragment>
   );
};

StreamsContainer.propTypes = {
   streams: PropTypes.arrayOf(streamType).isRequired,
};

export default StreamsContainer;
