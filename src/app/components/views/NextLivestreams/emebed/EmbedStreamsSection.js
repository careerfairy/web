import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { forceCheck } from "react-lazyload";
import { SwipeablePanel } from "../../../../materialUI/GlobalPanels/GlobalPanels";
import { isEmpty, isLoaded } from "react-redux-firebase";
import {
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@material-ui/core";
import * as PropTypes from "prop-types";
import EmbedStreamCard from "./EmbedStreamCard";

const useStyles = makeStyles((theme) => ({
  loaderWrapper: {
    display: "grid",
    width: "100%",
    height: "40vh",
    placeItems: "center",
  },
  wrapper: {
    minHeight: "80vh",
  },
  streamsContainer: {
    padding: theme.spacing(2, 0),
  },
}));

const EmbedStreamsSection = ({
  currentGroup,
  pastLivestreams,
  upcomingLivestreams,
  value,
}) => {
  const classes = useStyles();
  useEffect(() => {
    forceCheck();
  }, [value]);

  const renderStreams = (streams, isPastLivestreams) => {
    return (
      <Grid className={classes.streamsContainer} container spacing={2}>
        {isEmpty(streams) ? (
          <Grid item xs={12}>
            <Typography variant="h5" color="textSecondary" align="center">
              {currentGroup.universityName} currently has no{" "}
              {isPastLivestreams ? "past" : "scheduled"} live streams
            </Typography>
          </Grid>
        ) : (
          streams.map((stream) => (
            <Grid xs={12} sm={6} lg={4} item>
              <EmbedStreamCard stream={stream} />
            </Grid>
          ))
        )}
      </Grid>
    );
  };

  return (
    <Container className={classes.wrapper}>
      <SwipeablePanel value={value} index={"upcomingEvents"}>
        {isLoaded(upcomingLivestreams) ? (
          renderStreams(upcomingLivestreams)
        ) : (
          <div className={classes.loaderWrapper}>
            <CircularProgress color="primary" />
          </div>
        )}
      </SwipeablePanel>
      <SwipeablePanel value={value} index={"pastEvents"}>
        {isLoaded(pastLivestreams) ? (
          renderStreams(pastLivestreams, true)
        ) : (
          <div className={classes.loaderWrapper}>
            <CircularProgress color="primary" />
          </div>
        )}
      </SwipeablePanel>
    </Container>
  );
};

EmbedStreamsSection.propTypes = {
  value: PropTypes.string.isRequired,
  dir: PropTypes.any,
  upcomingLivestreams: PropTypes.arrayOf(PropTypes.any),
  livestreamId: PropTypes.any,
  setSelectedOptions: PropTypes.func,
  selectedOptions: PropTypes.arrayOf(PropTypes.any),
  currentGroup: PropTypes.any,
  pastLivestreams: PropTypes.any,
};

export default EmbedStreamsSection;
