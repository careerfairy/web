import React, {useEffect, useMemo, useState} from "react";
import {Container, Grid} from "@material-ui/core";
import TotalRegistrations from "./TotalRegistrations";
import TotalUniqueRegistrations from "./TotalUniqueRegistrations";
import LatestEvents from "./LatestEvents";
import TypeOfParticipants from "./TypeOfParticipants";
import AverageRegistrations from "./AverageRegistrations";
import {mustBeNumber, snapShotsToData} from "../../../../../helperFunctions/HelperFunctions";
import NumberOfFollowers from "./NumberOfFollowers";
import Title from "./Title";
import {handleFlattenOptions} from "../../../../../helperFunctions/streamFormFunctions";
import {makeStyles} from "@material-ui/core/styles";

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
const General = ({
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
    const [fetchingFollowers, setFetchingFollowers] = useState(false);
    const [currentTimeFrame, setCurrentTimeFrame] = useState({});
    const [currentStream, setCurrentStream] = useState({});


    useEffect(() => {
        (async function () {
            setFetchingFollowers(true);
            const snapshots = await firebase.getFollowers(group.id)
            const followerData = snapShotsToData(snapshots);
            setTotalFollowers(followerData);
            setFetchingFollowers(false);
        })()
    }, [group.id]);

    useEffect(() => {
        setCurrentTimeFrame(globalTimeFrame.timeFrames[0])
    }, [globalTimeFrame])

    const getTotalRegisteredUsers = () => {
        const total = livestreams.reduce(
            (accumulator, {registeredUsers}) =>
                accumulator + registeredUsers.length,
            0
        );
        // Checks if the result is a number
        return mustBeNumber(total);
    };

    const getUniqueUsers = (livestreams, prop = "registeredUsers") => {
        const totalViewers = livestreams.reduce(
            (accumulator, livestream) => {
                return [...accumulator, ...livestream[prop]];
            },
            []
        );

        // new Set method removes all duplicates from array
        const uniqueRegisteredUsers = [...new Set(totalViewers)];
        return {
            amount: mustBeNumber(uniqueRegisteredUsers.length),
            data: uniqueRegisteredUsers
        };
    };

    const getAverageRegistrationsPerEvent = () => {
        const average = totalRegistrations / livestreams.length;
        return mustBeNumber(average, 0);
    };

    const getMostRecentEvents = (timeframe, limit = 500) => {
        const targetTime = new Date(timeframe)
        const recentStreams = livestreams.filter((stream) => {
            if (stream.start?.toDate() > targetTime
                && stream.start?.toDate() < now
            ) {
                return stream
            }
        });
        return recentStreams.slice(0, limit)
    }
    const getFutureEvents = (timeframe, limit = 500) => {
        const targetTime = new Date(timeframe)
        const futureStreams = livestreams.filter((stream) => {
            if (stream.start?.toDate() > now) {
                return stream
            }
        });
        return futureStreams.slice(0, limit)
    }

    const getStreamsToCompare = () => {
        const timeAgo = globalTimeFrame.globalDate
        const doubleTimeAgo = globalTimeFrame.double
        const streamsFromTimeAgo = livestreams.filter(stream => stream.start.toDate() >= timeAgo)
        const streamsFromDoubleTimeAgo = livestreams.filter(stream => stream.start.toDate() >= doubleTimeAgo && stream.start.toDate() <= timeAgo)
        return {streamsFromTimeAgo, streamsFromDoubleTimeAgo}
    }

    const compareRegistrations = () => {
        const {streamsFromDoubleTimeAgo, streamsFromTimeAgo} = getStreamsToCompare()
        const registrationsTimAgo = streamsFromTimeAgo.reduce(
            (accumulator, {registeredUsers}) =>
                accumulator + registeredUsers.length,
            0
        );
        const registrationsDoubleTimeAgo = streamsFromDoubleTimeAgo.reduce(
            (accumulator, {registeredUsers}) =>
                accumulator + registeredUsers.length,
            0
        );
        const {
            positive,
            percentage,
        } = getStats(registrationsTimAgo, registrationsDoubleTimeAgo)

        return {
            positive,
            percentage: `${percentage}%`
        }
    }

    const compareUniqueRegistrations = () => {
        const {streamsFromDoubleTimeAgo, streamsFromTimeAgo} = getStreamsToCompare()
        const registrationsTimAgo = getUniqueUsers(streamsFromTimeAgo).amount
        const registrationsDoubleTimeAgo = getUniqueUsers(streamsFromDoubleTimeAgo).amount
        const {
            positive,
            percentage,
        } = getStats(registrationsTimAgo, registrationsDoubleTimeAgo)

        return {
            positive,
            percentage: `${percentage}%`
        }
    }

    const getStats = (lastMonthsRegistrations, lastTwoMonthsRegistrations) => {
        const difference = lastMonthsRegistrations - lastTwoMonthsRegistrations
        const positive = Boolean(lastMonthsRegistrations > lastTwoMonthsRegistrations)
        let percentage
        if (difference > 0) {
            percentage = (difference / (lastTwoMonthsRegistrations || 1)) * 100
        } else {
            percentage = (difference / (lastMonthsRegistrations || 1)) * 100
        }
        return {
            positive,
            percentage: mustBeNumber(percentage, 0)
        }
    }

    const getAggregateCategories = (participants) => {
        let categories = []
        participants.forEach(user => {
            const matched = user.registeredGroups?.find(groupData => groupData.groupId === group.id)
            if (matched) {
                categories.push(matched)
            }
        })
        return categories
    }

    const getTypeOfStudents = () => {
        let students = []
        if (currentStream.participatingStudents) {
            students = currentStream.participatingStudents
        } else {
            students = getUniqueUsers(livestreams, "participatingStudents").data
        }
        const aggregateCategories = getAggregateCategories(students)
        const flattenedGroupOptions = handleFlattenOptions(group)
        flattenedGroupOptions.forEach(option => {
            option.count = aggregateCategories.filter(category => category.categories.some(userOption => userOption.selectedValueId === option.id)).length
        })
        return flattenedGroupOptions.sort((a, b) => b.count - a.count);
    }


    // use Memo is great for optimizing expensive calculations, the value of the function call will be stored in memory
    // The function will only be re-called when the value(livestreams) in the dependency array changes
    const mostRecentEvents = useMemo(() => getMostRecentEvents(currentTimeFrame.date), [
        livestreams, currentTimeFrame
    ]);
    const futureStreams = useMemo(() => getFutureEvents(currentTimeFrame.date), [
        livestreams, currentTimeFrame
    ]);

    const totalRegistrations = useMemo(() => getTotalRegisteredUsers(), [
        livestreams,
    ]);

    const totalUniqueRegistrations = useMemo(() => getUniqueUsers(livestreams).amount, [
        livestreams,
    ]);

    const averageRegistrations = useMemo(
        () => getAverageRegistrationsPerEvent(),
        [livestreams]
    );

    const registrationsStatus = useMemo(
        () => compareRegistrations(),
        [livestreams]
    );
    const uniqueRegistrationsStatus = useMemo(
        () => compareUniqueRegistrations(),
        [livestreams]
    );

    const typesOfOptions = useMemo(
        () => getTypeOfStudents(),
        [livestreams, currentStream]
    );

    return (
        <Container className={classes.root} maxWidth={false}>
            <Grid container spacing={3}>
                <Grid item lg={12} sm={12} xl={12} xs={12}>
                    <Title
                        setGlobalTimeFrame={setGlobalTimeFrame}
                        globalTimeFrames={globalTimeFrames}
                        globalTimeFrame={globalTimeFrame}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <TotalRegistrations
                        fetchingStreams={fetchingStreams}
                        registrationsStatus={registrationsStatus}
                        totalRegistrations={totalRegistrations}
                        timeFrames={globalTimeFrame.timeFrames}
                        globalTimeFrame={globalTimeFrame}
                        group={group}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <TotalUniqueRegistrations
                        fetchingStreams={fetchingStreams}
                        uniqueRegistrationsStatus={uniqueRegistrationsStatus}
                        totalUniqueRegistrations={totalUniqueRegistrations}
                        timeFrames={globalTimeFrame.timeFrames}
                        globalTimeFrame={globalTimeFrame}
                        group={group}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <AverageRegistrations
                        fetchingStreams={fetchingStreams}
                        averageRegistrations={averageRegistrations}
                        timeFrames={globalTimeFrame.timeFrames}
                        group={group}
                    />
                </Grid>
                <Grid item lg={3} sm={6} xl={3} xs={12}>
                    <NumberOfFollowers
                        fetchingFollowers={fetchingFollowers}
                        totalFollowers={totalFollowers.length}
                        timeFrames={globalTimeFrame.timeFrames}
                        group={group}
                    />
                </Grid>
                <Grid item lg={8} md={12} xl={9} xs={12}>
                    <LatestEvents
                        currentTimeFrame={currentTimeFrame}
                        mostRecentEvents={mostRecentEvents}
                        timeFrames={globalTimeFrame.timeFrames}
                        setCurrentStream={setCurrentStream}
                        futureStreams={futureStreams}
                        setCurrentTimeFrame={setCurrentTimeFrame}
                        group={group}
                    />
                </Grid>
                <Grid item lg={4} md={6} xl={3} xs={12}>
                    <TypeOfParticipants
                        currentStream={currentStream}
                        typesOfOptions={typesOfOptions}
                        setCurrentStream={setCurrentStream}
                        group={group}
                    />
                </Grid>
            </Grid>
        </Container>

    );
};

export default General;
