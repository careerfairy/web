import React, {useEffect, useMemo, useState} from "react";
import {Container, Grid, makeStyles} from "@material-ui/core";
import TotalRegistrations from "./TotalRegistrations";
import TotalUniqueRegistrations from "./TotalUniqueRegistrations";
import LatestEvents from "./LatestEvents";
import TypeOfParticipants from "./TypeOfParticipants";
import AverageRegistrations from "./AverageRegistrations";
import FeedbackResults from "./FeedbackResults";
import UpVotedQuestionsTable from "./UpVotedQuestionsTable";
import {
    getTimeFromNow,
    mustBeNumber,
    snapShotsToData,
} from "../../../../helperFunctions/HelperFunctions";
import NumberOfFollowers from "./NumberOfFollowers";
import { v4 as uuid } from 'uuid';


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
        date: new Date().setDate(new Date().getDate() - 7),
        id: uuid()
    },
    {
        name: "30 Days",
        pastName: "Last Month",
        date: new Date().setMonth(new Date().getMonth() - 1),
        id: uuid()
    },
    {
        name: "4 Months",
        pastName: "Last 4 months",
        date: new Date().setMonth(new Date().getMonth() - 3),
        id: uuid()
    },
    {
        name: "6 Months",
        pastName: "Last 6 months",
        date: new Date().setMonth(new Date().getMonth() - 6),
        id: uuid()
    },
    {
        name: "1 Year",
        pastName: "Last year",
        date: new Date().setFullYear(new Date().getFullYear() - 1),
        id: uuid()
    },
]

const AnalyticsOverview = ({firebase, group}) => {
    const classes = useStyles();
    const [currentTimeFrame, setCurrentTimeFrame] = useState(timeFrames[4]);
    const [livestreams, setLivestreams] = useState([]);
    const [totalFollowers, setTotalFollowers] = useState([]);
    const [fetchingStreams, setFetchingStreams] = useState(false);
    const [fetchingFollowers, setFetchingFollowers] = useState(false);

    useEffect(() => {
        setFetchingStreams(true);
        const unsubscribe = firebase.listenToAllLivestreamsOfGroup(
            group.id,
            (snapshots) => {
                const livestreamData = snapShotsToData(snapshots).reverse();
                setFetchingStreams(false);
                setLivestreams(livestreamData);
            }
        );
        return () => unsubscribe();
    }, []);


    useEffect(() => {
        (async function () {
            setFetchingFollowers(true);
            const snapshots = await firebase.getFollowers(group.id)
            const followerData = snapShotsToData(snapshots);
            setTotalFollowers(followerData);
            setFetchingFollowers(false);
        })()
    }, [group.id]);

    const getTotalRegisteredUsers = () => {
        const total = livestreams.reduce(
            (accumulator, {registeredUsers}) =>
                accumulator + registeredUsers.length,
            0
        );
        // Checks if the result is a number
        return mustBeNumber(total);
    };

    const getUniqueRegisteredUsers = () => {
        const totalViewers = livestreams.reduce(
            (accumulator, {registeredUsers}) => {
                return [...accumulator, ...registeredUsers];
            },
            []
        );

        // new Set method removes all duplicates from array
        const uniqueRegisteredUsers = [...new Set(totalViewers)];
        return mustBeNumber(uniqueRegisteredUsers.length);
    };

    const getAverageRegistrationsPerEvent = () => {
        const average = totalRegistrations / livestreams.length;
        return mustBeNumber(average);
    };

    const getMostRecentEvents = (timeframe, limit = 50) => {
        const recentStreams = livestreams.filter((stream) => {
            if (stream.start?.toDate() >= timeframe) {
                return stream
            }
        });
        return recentStreams.slice(0, limit)
    }


    // use Memo is great for optimizing expensive calculations, the value of the function call will be stored in memory
    // The function will only be re-called when the value(livestreams) in the dependency array changes
    const mostRecentEvents = useMemo(() => getMostRecentEvents(currentTimeFrame.date), [
        livestreams, currentTimeFrame
    ]);

    const totalRegistrations = useMemo(() => getTotalRegisteredUsers(), [
        livestreams,
    ]);

    const totalUniqueRegistrations = useMemo(() => getUniqueRegisteredUsers(), [
        livestreams,
    ]);

    const averageRegistrations = useMemo(
        () => getAverageRegistrationsPerEvent(),
        [livestreams]
    );

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={3}>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <TotalRegistrations
                        fetchingStreams={fetchingStreams}
                        totalRegistrations={totalRegistrations}
                        timeFrames={timeFrames}
                        group={group}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <TotalUniqueRegistrations
                        fetchingStreams={fetchingStreams}
                        totalUniqueRegistrations={totalUniqueRegistrations}
                        timeFrames={timeFrames}
                        group={group}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <AverageRegistrations
                        fetchingStreams={fetchingStreams}
                        averageRegistrations={averageRegistrations}
                        timeFrames={timeFrames}
                        group={group}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <NumberOfFollowers
                        fetchingFollowers={fetchingFollowers}
                        totalFollowers={totalFollowers.length}
                        timeFrames={timeFrames}
                        group={group}
                    />
                </Grid>
                <Grid item lg={8} md={12} xl={9} xs={12}>
                    <LatestEvents
                        currentTimeFrame={currentTimeFrame}
                        mostRecentEvents={mostRecentEvents}
                        timeFrames={timeFrames}
                        setCurrentTimeFrame={setCurrentTimeFrame}
                        group={group}
                    />
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
