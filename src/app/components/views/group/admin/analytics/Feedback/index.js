import React, {useEffect, useMemo, useState} from "react";
import {Container, Grid} from "@material-ui/core";

import {makeStyles} from "@material-ui/core/styles";
import LatestEvents from "../common/LatestEvents";
import FeedbackTable from "./FeedbackTable";


const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: "100%",
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
        width: "100%"
    }
}))
const Feedback = ({
                      group,
                      globalTimeFrame,
                      futureStreams,
                      userType,
                      setUserType,
                      userTypes,
                      fetchingStreams,
                      streamDataTypes,
                      streamsFromTimeFrame,
                      streamsFromTimeFrameAndFuture,
                      groupOptions,
                      totalFollowers,
                      streamDataType,
                      setStreamDataType,
                      handleToggleBar,
                      currentStream,
                      setCurrentStream,
                      showBar
                  }) => {
    const classes = useStyles()


    const getUsers = () => {
        if (currentStream) {
            return currentStream[userType.propertyDataName]
        } else {
            const totalViewers = streamsFromTimeFrameAndFuture.reduce(
                (accumulator, livestream) => {
                    return [...accumulator, ...livestream[userType.propertyDataName]];
                },
                []
            );
            return totalViewers.filter(function (el) {
                if (!this[el.userEmail]) {
                    this[el.userEmail] = true;
                    return true;
                }
                return false;
            }, Object.create(null))
        }
    };

    const totalUniqueUsers = useMemo(() => getUsers(), [
        streamsFromTimeFrameAndFuture, currentStream, userType
    ]);

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={3}>
                <Grid item lg={12} md={12} xl={12} xs={12}>
                    <LatestEvents
                        timeFrames={globalTimeFrame.timeFrames}
                        setCurrentStream={setCurrentStream}
                        futureStreams={futureStreams}
                        fetchingStreams={fetchingStreams}
                        streamsFromTimeFrame={streamsFromTimeFrame}
                        userType={userType}
                        userTypes={userTypes}
                        isFeedback
                        handleToggleBar={handleToggleBar}
                        showBar={showBar}
                        setUserType={setUserType}
                        group={group}
                    />
                </Grid>
                <Grid item lg={12} md={12} xl={12} xs={12}>
                    <FeedbackTable
                        totalUniqueUsers={totalUniqueUsers}
                        currentStream={currentStream}
                        fetchingStreams={fetchingStreams}
                        groupOptions={groupOptions}
                        streamDataType={streamDataType}
                        setStreamDataType={setStreamDataType}
                        streamDataTypes={streamDataTypes}
                        futureStreams={futureStreams}
                        streamsFromTimeFrameAndFuture={streamsFromTimeFrameAndFuture}
                        userType={userType}
                        group={group}/>
                </Grid>
                {/*<Grid item lg={4} md={6} xl={3} xs={12}>*/}
                {/*    <FeedbackResults group={group}/>*/}
                {/*</Grid>*/}
            </Grid>
        </Container>
    );
};

export default Feedback;
