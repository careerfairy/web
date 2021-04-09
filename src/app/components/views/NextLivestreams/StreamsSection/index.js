import {SwipeablePanel} from "../../../../materialUI/GlobalPanels/GlobalPanels";
import {isLoaded} from "react-redux-firebase";
import NextLivestreams from "../NextLivestreams";
import {CircularProgress} from "@material-ui/core";
import * as PropTypes from "prop-types";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    loaderWrapper: {
        display: "grid",
        width: "100%",
        height: "40vh",
        placeItems: "center"
    }
}));
export function StreamsSection({
                                   currentGroup,
                                   livestreamId,
                                   pastLivestreams,
                                   selectedOptions,
                                   setSelectedOptions,
                                   upcomingLivestreams,
                                   value
                               }) {
    const classes = useStyles()
    return <div>
        <SwipeablePanel value={value} index={0}>
            {isLoaded(upcomingLivestreams) ? (
                <NextLivestreams
                    livestreamId={livestreamId}
                    setSelectedOptions={setSelectedOptions}
                    selectedOptions={selectedOptions}
                    livestreams={upcomingLivestreams || []}
                    currentGroup={currentGroup}/>
            ) : (
                <div className={classes.loaderWrapper}>
                    <CircularProgress color="primary"/>
                </div>
            )}
        </SwipeablePanel>
        <SwipeablePanel value={value} index={1}>
            {isLoaded(pastLivestreams) ? (
                <NextLivestreams
                    livestreamId={livestreamId}
                    setSelectedOptions={setSelectedOptions}
                    selectedOptions={selectedOptions}
                    isPastLivestreams
                    livestreams={pastLivestreams || []}
                    currentGroup={currentGroup}/>
            ) : (
                <div className={classes.loaderWrapper}>
                    <CircularProgress color="primary"/>
                </div>
            )}
        </SwipeablePanel>
    </div>;
}

StreamsSection.propTypes = {
    value: PropTypes.number,
    dir: PropTypes.any,
    upcomingLivestreams: PropTypes.arrayOf(PropTypes.any),
    livestreamId: PropTypes.any,
    setSelectedOptions: PropTypes.func,
    selectedOptions: PropTypes.arrayOf(PropTypes.any),
    currentGroup: PropTypes.any,
    classes: PropTypes.any,
    pastLivestreams: PropTypes.any
};