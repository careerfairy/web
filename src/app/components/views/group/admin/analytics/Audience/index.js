import React, {useMemo, useState} from "react";
import {Container, Grid} from "@material-ui/core";

import FeedbackResults from "./FeedbackResults";

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
                      livestreams,
                      globalTimeFrame,
                      currentTimeFrame,
                      mostRecentEvents,
                      futureStreams,
                      userType,
                      setUserType,
                      userTypes,
                      fetchingStreams,
                      groupOptions

                  }) => {
    const classes = useStyles()
    const [currentStream, setCurrentStream] = useState(null);

    const getUsers = (livestreams, prop = "registeredUsers") => {
        if (currentStream) {
            return currentStream[prop]
        } else {
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
        }
    };

    const totalUniqueUsers = useMemo(() => getUsers(livestreams, userType.propertyName), [
        livestreams, currentStream, userType
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
                        fetchingStreams={fetchingStreams}
                        groupOptions={groupOptions}
                        livestreams={livestreams}
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

export default Audience;
