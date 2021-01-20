import React, {useMemo} from "react";
import {Container, Grid} from "@material-ui/core";

import {makeStyles} from "@material-ui/core/styles";
import LatestEvents from "../common/LatestEvents";
import UsersTable from "./UsersTable";


const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: "100%",
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
        width: "100%"
    }
}))
const Audience = ({
                      group,
                      globalTimeFrame,
                      futureStreams,
                      userType,
                      setUserType,
                      userTypes,
                      fetchingStreams,
                      streamsFromTimeFrame,
                      streamsFromTimeFrameAndFuture,
                      groupOptions,
                      handleToggleBar,
                      breakdownRef,
                      setCurrentStream,
                      handleScrollToBreakdown,
                      currentStream,
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
                        currentStream={currentStream}
                        handleToggleBar={handleToggleBar}
                        showBar={showBar}
                        handleScrollToBreakdown={handleScrollToBreakdown}
                        setUserType={setUserType}
                        group={group}
                    />
                </Grid>
                <Grid item lg={12} md={12} xl={12} xs={12}>
                    <UsersTable
                        totalUniqueUsers={totalUniqueUsers}
                        currentStream={currentStream}
                        fetchingStreams={fetchingStreams}
                        groupOptions={groupOptions}
                        breakdownRef={breakdownRef}
                        futureStreams={futureStreams}
                        streamsFromTimeFrameAndFuture={streamsFromTimeFrameAndFuture}
                        userType={userType}
                        group={group}/>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Audience;
