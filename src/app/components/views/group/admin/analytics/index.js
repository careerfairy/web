import React, {useEffect, useMemo, useState} from "react";
import {Card, CardHeader, Container, Grid, makeStyles} from "@material-ui/core";
import TotalRegistrations from "./TotalRegistrations";
import TotalUniqueRegistrations from "./TotalUniqueRegistrations";
import LatestEvents from "./LatestEvents";
import TypeOfParticipants from "./TypeOfParticipants";
import AverageRegistrations from "./AverageRegistrations";
import FeedbackResults from "./FeedbackResults";
import UpVotedQuestionsTable from "./UpVotedQuestionsTable";
import {mustBeNumber, snapShotsToData, timeAgo,} from "../../../../helperFunctions/HelperFunctions";
import NumberOfFollowers from "./NumberOfFollowers";
import {v4 as uuid} from 'uuid';
import Title from "./Title";
import dayjs from "dayjs";
import {handleFlattenOptions} from "../../../../helperFunctions/streamFormFunctions";


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: "100%",
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3),
    },
}));

const sevenDays = new Date().setDate(new Date().getDate() - 7)
const twoWeeks = new Date().setDate(new Date().getDate() - 14)

const thirtyDays = new Date().setMonth(new Date().getMonth() - 1)
const twoMonths = new Date().setMonth(new Date().getMonth() - 2)

const fourMonths = new Date().setMonth(new Date().getMonth() - 4)
const eightMonths = new Date().setMonth(new Date().getMonth() - 8)

const sixMonths = new Date().setMonth(new Date().getMonth() - 6)

const oneYear = new Date().setFullYear(new Date().getFullYear() - 1)
const twoYears = new Date().setFullYear(new Date().getFullYear() - 2)

const timeFrames = [
    {
        name: "1 Year",
        pastName: "year",
        date: oneYear,
        id: uuid()
    },
    {
        name: "6 Months",
        pastName: "6 months",
        date: sixMonths,
        id: uuid()
    },
    {
        name: "4 Months",
        pastName: "4 months",
        date: fourMonths,
        id: uuid()
    },
    {
        name: "month",
        pastName: "month",
        date: thirtyDays,
        id: uuid()
    },
    {
        defaultName: "7 Days",
        pastName: "week",
        date: sevenDays,
        id: uuid()
    },
]

const globalTimeFrames = [
    {
        globalDate: oneYear,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= oneYear),
        name: "year",
        id: uuid(),
        double: twoYears
    },
    {
        globalDate: sixMonths,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= sixMonths),
        name: "six months",
        id: uuid(),
        double: oneYear
    },
    {
        globalDate: fourMonths,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= fourMonths),
        name: "four months",
        id: uuid(),
        double: eightMonths
    },
    {
        globalDate: thirtyDays,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= thirtyDays),
        name: "month",
        id: uuid(),
        double: twoMonths
    },
    {
        globalDate: sevenDays,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= sevenDays),
        name: "week",
        id: uuid(),
        double: twoWeeks
    },
]

const AnalyticsOverview = ({firebase, group}) => {
    const classes = useStyles();

    const [globalTimeFrame, setGlobalTimeFrame] = useState(globalTimeFrames[2]);
    const [livestreams, setLivestreams] = useState([]);
    const [totalFollowers, setTotalFollowers] = useState([]);
    const [fetchingStreams, setFetchingStreams] = useState(false);
    const [fetchingFollowers, setFetchingFollowers] = useState(false);
    const [currentTimeFrame, setCurrentTimeFrame] = useState({});
    const [currentStream, setCurrentStream] = useState({});

    useEffect(() => {
        setFetchingStreams(true);
        const unsubscribe = firebase.listenToAllLivestreamsOfGroup(
            group.id,
            (snapshots) => {
                let livestreams = []
                snapshots.docs.forEach(async (snap, index, arr) => {
                    const livestream = snap.data()

                    livestream.id = snap.id
                    const participatingSnap = await firebase.getLivestreamParticipatingStudents(snap.id)
                    const talentPoolSnap = await firebase.getLivestreamTalentPoolMembers(livestream.companyId)
                    livestream.participatingStudents = snapShotsToData(participatingSnap)
                    livestream.talentPool = snapShotsToData(talentPoolSnap)
                    livestreams.push(livestream)
                    if (index === arr.length - 1) {
                        const livestreamData = livestreams.reverse();
                        setFetchingStreams(false);
                        setLivestreams(livestreamData);
                    }
                })

            }, new Date(globalTimeFrame.double)
        );
        return () => unsubscribe();
    }, [globalTimeFrame]);


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

    const getMostRecentEvents = (timeframe, limit = 50) => {
        const recentStreams = livestreams.filter((stream) => {
            if (stream.start?.toDate() >= timeframe) {
                return stream
            }
        });
        return recentStreams.slice(0, limit)
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
        return flattenedGroupOptions
    }


    // use Memo is great for optimizing expensive calculations, the value of the function call will be stored in memory
    // The function will only be re-called when the value(livestreams) in the dependency array changes
    const mostRecentEvents = useMemo(() => getMostRecentEvents(currentTimeFrame.date), [
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
                        setCurrentTimeFrame={setCurrentTimeFrame}
                        group={group}
                    />
                </Grid>
                <Grid item lg={4} md={6} xl={3} xs={12}>
                    <TypeOfParticipants
                        currentStream={currentStream}
                        typesOfOptions={typesOfOptions}
                        timeFrames={timeFrames}
                        group={group}
                    />
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
