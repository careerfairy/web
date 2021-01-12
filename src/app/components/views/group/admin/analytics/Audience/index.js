import React, {useEffect, useState} from "react";
import {Container, Grid} from "@material-ui/core";

import FeedbackResults from "./FeedbackResults";

import {makeStyles} from "@material-ui/core/styles";
import UsersTable from "./UsersTable";

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
                     setGlobalTimeFrame
                 }) => {
    const classes = useStyles()
    const [totalFollowers, setTotalFollowers] = useState([]);
    const [currentTimeFrame, setCurrentTimeFrame] = useState({});
    const [currentStream, setCurrentStream] = useState({});

    useEffect(() => {
        setCurrentTimeFrame(globalTimeFrame.timeFrames[0])
    }, [globalTimeFrame])

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={3}>
                <Grid item lg={12} md={12} xl={12} xs={12}>
                    <UsersTable group={group}/>
                </Grid>
                <Grid item lg={4} md={6} xl={3} xs={12}>
                    <FeedbackResults group={group}/>
                </Grid>
            </Grid>
        </Container>

    );
};

export default Audience;
