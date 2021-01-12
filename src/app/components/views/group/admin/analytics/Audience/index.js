import React, {useEffect, useMemo, useState} from "react";
import {Container, Grid} from "@material-ui/core";

import FeedbackResults from "./FeedbackResults";

import {makeStyles} from "@material-ui/core/styles";
import UsersTable from "./UsersTable";
import LatestEvents from "../common/LatestEvents";
import TypeOfParticipants from "../General/TypeOfParticipants";

const now = new Date()

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
                      firebase,
                      group,
                      livestreams,
                      fetchingStreams,
                      globalTimeFrames,
                      globalTimeFrame,
                      setGlobalTimeFrame,
                      currentTimeFrame,
                      mostRecentEvents,
                      setCurrentTimeFrame,
                      futureStreams,
                      userType,
                      setUserType,
                      userTypes,
                  }) => {
    const classes = useStyles()
    const [currentStream, setCurrentStream] = useState(null);
    console.log("-> currentStream", currentStream);

    const getUsers = (livestreams, prop = "registeredUsers") => {

        const totalViewers = livestreams.reduce(
            (accumulator, livestream) => {
                return [...accumulator, ...livestream[prop]];
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
    };

    const totalUniqueUsers = useMemo(() => getUsers(livestreams), [
        livestreams, currentStream
    ]);

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={3}>
                <Grid item lg={12} md={12} xl={12} xs={12}>
                    <LatestEvents
                        currentTimeFrame={currentTimeFrame}
                        mostRecentEvents={mostRecentEvents}
                        timeFrames={globalTimeFrame.timeFrames}
                        setCurrentStream={setCurrentStream}
                        futureStreams={futureStreams}
                        livestreams={livestreams}
                        userType={userType}
                        userTypes={userTypes}
                        setUserType={setUserType}
                        group={group}
                    />
                </Grid>
                <Grid item lg={12} md={12} xl={12} xs={12}>
                    <UsersTable
                        totalUniqueUsers={totalUniqueUsers}
                        currentStream={currentStream}
                        userType={userType}
                        group={group}/>
                </Grid>
                <Grid item lg={4} md={6} xl={3} xs={12}>
                    <FeedbackResults group={group}/>
                </Grid>
            </Grid>
        </Container>

    );
};

export default Audience;
