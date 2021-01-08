import React, {useEffect, useMemo, useState} from "react";
import {Container, Grid, makeStyles} from "@material-ui/core";
import TotalRegistrations from "./TotalRegistrations";
import TotalUniqueRegistrations from "./TotalUniqueRegistrations";
import LatestEvents from "./LatestEvents";
import TypeOfParticipants from "./TypeOfParticipants";
import AverageRegistrations from "./AverageRegistrations";
import NumberOfFollowers from "./NumberofFollowers";
import FeedbackResults from "./FeedbackResults";
import UpVotedQuestionsTable from "./UpVotedQuestionsTable";
import {mustBeNumber, snapShotsToData} from "../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: "100%",
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
    },
}));

const timeFrames = [
    {
        defaultName: "7 Days",
        pastName: "Last week",
        seconds: 604800,
    },
    {
        name: "30 Days",
        pastName: "Last Month",
        seconds: 2592000
    },
    {
        name: "4 Months",
        pastName: "Last 4 months",
        seconds: 10368000
    },
    {
        name: "6 Months",
        pastName: "Last 6 months",
        seconds: 15552000
    },
    {
        name: "1 Year",
        pastName: "Last year",
        seconds: 31556952
    }
]

const AnalyticsOverview = ({firebase, group}) => {
    const classes = useStyles();
    const [currentTimeFrame, setCurrentTimeFrame] = useState({});
    const [livestreams, setLivestreams] = useState([]);

    useEffect(() => {
        const unsubscribe = firebase.listenToAllLivestreamsOfGroup(group.id, (snapshots => {
            const livestreamData = snapShotsToData(snapshots)
            setLivestreams(livestreamData)
        }))
        return () => unsubscribe()
    }, []);


    const getTotalRegisteredUsers = () => {
        const total = livestreams.reduce((accumulator, {registeredUsers}) => accumulator + registeredUsers.length, 0);
        // Checks if the result is a number
        return mustBeNumber(total)
    }

    const getUniqueRegisteredUsers = () => {
        const totalViewers = livestreams.reduce((accumulator, {registeredUsers}) => {
            return [...accumulator, ...registeredUsers]
        }, []);

        // new Set method removes all duplicates from array
        const uniqueRegisteredUsers = [...new Set(totalViewers)]
        return mustBeNumber(uniqueRegisteredUsers.length)
    }

    const getAverageRegistrationsPerEvent = () => {
        const average = totalRegistrations / livestreams.length
        return mustBeNumber(average)
    }

    // use Memo is great for optimizing expensive calculations, the value of the function call will be stored in memory
    // The function will only be re-called when the value(livestreams) in the dependency array changes
    const totalRegistrations = useMemo(() => getTotalRegisteredUsers(), [livestreams]);

    const totalUniqueRegistrations = useMemo(() => getUniqueRegisteredUsers(), [livestreams]);

    const averageRegistrations = useMemo(() => getAverageRegistrationsPerEvent(), [livestreams]);


    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={3}>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <TotalRegistrations totalRegistrations={totalRegistrations} timeFrames={timeFrames} group={group}/>
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <TotalUniqueRegistrations totalUniqueRegistrations={totalUniqueRegistrations}
                                              timeFrames={timeFrames} group={group}/>
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <AverageRegistrations averageRegistrations={averageRegistrations} timeFrames={timeFrames}
                                          group={group}/>
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <NumberOfFollowers timeFrames={timeFrames} group={group}/>
                </Grid>
                <Grid item lg={8} md={12} xl={9} xs={12}>
                    <LatestEvents timeFrames={timeFrames} group={group}/>
                </Grid>
                <Grid item lg={4} md={6} xl={3} xs={12}>
                    <TypeOfParticipants timeFrames={timeFrames} group={group}/>
                </Grid>
                <Grid item lg={4} md={6} xl={3} xs={12}>
                    <FeedbackResults timeFrames={timeFrames} group={group}/>
                </Grid>
                <Grid item lg={8} md={12} xl={9} xs={12}>
                    <UpVotedQuestionsTable timeFrames={timeFrames} group={group}/>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AnalyticsOverview;
