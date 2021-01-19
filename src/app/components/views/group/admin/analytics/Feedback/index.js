import React, {useEffect, useMemo, useRef, useState} from "react";
import {Container, Grid} from "@material-ui/core";

import {makeStyles} from "@material-ui/core/styles";
import LatestEvents from "../common/LatestEvents";
import FeedbackTable from "./FeedbackTable";
import FeedbackGraph from "./FeedbackGraph";
import TypeOfParticipants from "../General/TypeOfParticipants";
import RatingSideTable from "./RatingSideTable";
import UsersTable from "../Audience/UsersTable";


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
                      fetchingPolls,
                      fetchingQuestions,
                      fetchingRatings,
                      handleScrollToBreakdown,
                      breakdownRef,
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
    const sideRef = useRef(null)

    const [currentPoll, setCurrentPoll] = useState(null);
    const [currentRating, setCurrentRating] = useState(null);

    useEffect(() => {
        setCurrentPoll(null)
        setCurrentRating(null)
    }, [currentStream?.id])


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

    const isRating = () => {
        return Boolean(streamDataType.propertyName === "feedback")
    }
    const isPoll = () => {
        return Boolean(streamDataType.propertyName === "pollEntries")
    }
    const isQuestion = () => {
        return Boolean(streamDataType.propertyName === "questions")
    }

    const isFetching = () => {
        return Boolean(
            fetchingStreams || fetchingRatings || fetchingQuestions || fetchingPolls
        )
    }

    const handleScrollToSideRef = () => {
        sideRef.current.scrollIntoView({behavior: 'smooth', block: 'start'})
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
                        fetchingStreams={fetchingStreams}
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
                        totalUniqueUsers={totalUniqueUsers}
                        currentStream={currentStream}
                        fetchingStreams={isFetching()}
                        groupOptions={groupOptions}
                        streamDataType={streamDataType}
                        setStreamDataType={setStreamDataType}
                        setCurrentRating={setCurrentRating}
                        currentPoll={currentPoll}
                        breakdownRef={breakdownRef}
                        handleScrollToSideRef={handleScrollToSideRef}
                        currentRating={currentRating}
                        setCurrentPoll={setCurrentPoll}
                        streamDataTypes={streamDataTypes}
                        futureStreams={futureStreams}
                        streamsFromTimeFrameAndFuture={streamsFromTimeFrameAndFuture}
                        userType={userType}
                        group={group}/>
                </Grid>
                {!isQuestion() &&
                <Grid  item lg={6} md={12} xl={6} xs={12}>
                    {isRating() ?
                        <RatingSideTable
                            streamDataType={streamDataType}
                            fetchingStreams={fetchingStreams}
                            sideRef={sideRef}
                            currentRating={currentRating}
                        />
                        :
                        <FeedbackGraph
                            currentPoll={currentPoll}
                            sideRef={sideRef}
                            currentStream={currentStream}
                            streamDataType={streamDataType}
                            typesOfOptions={[]}
                            userType={userType}
                            userTypes={userTypes}
                            setUserType={setUserType}
                            setCurrentStream={setCurrentStream}
                            group={group}
                        />}
                </Grid>}
            </Grid>
        </Container>
    );
};

export default Feedback;
