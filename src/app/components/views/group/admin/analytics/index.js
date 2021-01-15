import React, {useEffect, useState, Fragment, useMemo} from "react";
import {Container, fade, makeStyles} from "@material-ui/core";
import {snapShotsToData} from "../../../../helperFunctions/HelperFunctions";
import {v4 as uuid} from 'uuid';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import General from "./General";
import {useTheme} from "@material-ui/core/styles";
import {SwipeablePanel} from "../../../../../materialUI/GlobalPanels/GlobalPanels";
import Audience from "./Audience";
import Grid from "@material-ui/core/Grid";
import Title from "./Title";
import Box from "@material-ui/core/Box";
import {handleFlattenOptions} from "../../../../helperFunctions/streamFormFunctions";
import Feedback from "./Feedback";


const useStyles = makeStyles((theme) => ({

    indicator: {
        height: theme.spacing(0.8),
        padding: theme.spacing(0, 0.5)
    },
    tab: {
        fontWeight: 600
    },
    appBar: {
        boxShadow: "none",
        background: theme.palette.common.white,
        borderBottom: `1px solid ${fade(theme.palette.text.secondary, 0.3)}`

    },
    title: {
        background: theme.palette.common.white
    }
}));

const now = new Date()

const sevenDays = new Date().setDate(new Date().getDate() - 7)
const twoWeeks = new Date().setDate(new Date().getDate() - 14)

const fourWeeks = new Date().setDate(new Date().getDate() - 28)

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
        name: "2 Months",
        pastName: "2 months",
        date: twoMonths,
        id: uuid()
    },
    {
        name: "month",
        pastName: "month",
        date: thirtyDays,
        id: uuid()
    },
    {
        name: "week",
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
        globalDate: twoMonths,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= twoMonths),
        name: "two months",
        id: uuid(),
        double: fourMonths
    },
    {
        globalDate: thirtyDays,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= thirtyDays),
        name: "month",
        id: uuid(),
        double: twoMonths
    },
    {
        globalDate: twoWeeks,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= twoWeeks),
        name: "2 weeks",
        id: uuid(),
        double: fourWeeks
    },
    {
        globalDate: sevenDays,
        timeFrames: timeFrames.filter(timeOb => timeOb.date >= sevenDays),
        name: "week",
        id: uuid(),
        double: twoWeeks
    },
]

const userTypes = [
    {
        propertyName: "registeredUsers",
        displayName: "Registered Users",
        propertyDataName: "registeredUsersData"
    },
    {
        propertyName: "participatingStudents",
        displayName: "Participating Students",
        propertyDataName: "participatingStudentsData"
    },
    {
        propertyName: "talentPool",
        displayName: "Talent Pool",
        propertyDataName: "talentPoolData"
    }]
const streamDataTypes = [
    {
        propertyName: "questions",
        displayName: "Questions",
        propertyDataName: "questions"
    },
    {
        propertyName: "pollEntries",
        displayName: "Polls",
        propertyDataName: "pollEntries"
    },
    {
        propertyName: "feedback",
        displayName: "Feedback",
        propertyDataName: "feedback"
    }]

const AnalyticsOverview = ({firebase, group}) => {
    const classes = useStyles();
    const theme = useTheme()
    const [value, setValue] = useState(1);

    const [globalTimeFrame, setGlobalTimeFrame] = useState(globalTimeFrames[0]);
    const [showBar, setShowBar] = useState(false);
    const [livestreams, setLivestreams] = useState([]);
    const [fetchingStreams, setFetchingStreams] = useState(false);
    const [userType, setUserType] = useState(userTypes[0]);
    const [streamDataType, setStreamDataType] = useState(streamDataTypes[0]);
    const [groupOptions, setGroupOptions] = useState([]);
    const [currentStream, setCurrentStream] = useState(null);
    const [fetchingFollowers, setFetchingFollowers] = useState(false);
    const [totalFollowers, setTotalFollowers] = useState(null);


    useEffect(() => {
        const flattenedGroupOptions = handleFlattenOptions(group)
        setGroupOptions(flattenedGroupOptions)

    }, [group])


    useEffect(() => {
        (async function () {
            setFetchingFollowers(true);
            const snapshots = await firebase.getFollowers(group.id)
            const followerData = snapshots.docs.map(doc => ({id: doc.id, ...doc.data()}))
            setTotalFollowers(followerData);
            setFetchingFollowers(false);
        })()
    }, [group.id]);


    useEffect(() => {
        if (totalFollowers) {
            setFetchingStreams(true);
            const unsubscribe = firebase.listenToAllLivestreamsOfGroup(
                group.id,
                (snapshots) => {
                    const livestreamsData = snapshots.docs.map(snap => {
                        const livestream = snap.data()
                        livestream.id = snap.id
                        livestream.registeredUsersData = totalFollowers.filter(follower => {
                            return livestream.registeredUsers?.some(userEmail => userEmail === follower.userEmail)
                        })
                        livestream.participatingStudentsData = totalFollowers.filter(follower => {
                            return livestream.participatingStudents?.some(userEmail => userEmail === follower.userEmail)
                        })
                        livestream.talentPoolData = totalFollowers.filter(follower => {
                            return livestream.talentPool?.some(userEmail => userEmail === follower.userEmail)
                        })
                        return livestream
                    })
                    setLivestreams(livestreamsData.reverse())
                    setFetchingStreams(false)
                }, new Date(globalTimeFrame.double)
            );
            return () => unsubscribe();
        }
    }, [globalTimeFrame, group.id, totalFollowers]);

    useEffect(() => {
        if (currentStream?.id) {
            const unsubscribePolls = firebase.listenToPollEntries(currentStream.id, querySnapshot => {
                const pollEntries = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
                setCurrentStream(prevState => ({...prevState, pollEntries}));
            });
            return () => unsubscribePolls();
        }
    }, [currentStream?.id])

    useEffect(() => {
        if (currentStream?.id) {
            const unsubscribeQuestions = firebase.listenToLivestreamQuestions(currentStream.id, querySnapshot => {
                const questions = querySnapshot.docs.map(doc => {
                    const questionData = doc.data()
                    const authorData = totalFollowers.find(follower => follower.userEmail === questionData.author)
                    return {
                        id: doc.id,
                        ...questionData,
                        ...authorData
                    }
                })
                setCurrentStream(prevState => ({...prevState, questions}));
            });
            return () => unsubscribeQuestions();
        }
    }, [currentStream?.id])

    useEffect(() => {
        if (currentStream?.id) {
            (async function (){
                const ratingNameSnaps = await firebase.getLivestreamRatingNames("0SupFLhiCs5FdIxRc5Dp")
                console.log("-> ratingNameSnaps", ratingNameSnaps);
                const data = ratingNameSnaps.docs.map(doc => doc.id)
                console.log("-> data", data);

            })()

        }
    }, [currentStream?.id])

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const getFutureEvents = () => {
        return livestreams.filter((stream) => {
            if (stream.start?.toDate() > now) {
                return stream
            }
        });
    }

    const getStreamsFromTimeFrame = (timeframe) => {
        const targetTime = new Date(timeframe)
        return livestreams.filter((stream) => {
            const streamStart = stream.start?.toDate()
            return (streamStart > targetTime && streamStart < now)
        });
    }

    const getStreamsFromBeforeTimeFrame = () => {
        return livestreams.filter(stream => {
                const streamStart = stream.start?.toDate()
                return (streamStart < globalTimeFrame.globalDate)
            }
        )
    }

    const handleToggleBar = () => {
        setShowBar(!showBar)
    }

    const streamsFromTimeFrame = useMemo(() => getStreamsFromTimeFrame(globalTimeFrame.globalDate), [
        livestreams, globalTimeFrame
    ]);

    const streamsFromBeforeTimeFrame = useMemo(() => getStreamsFromBeforeTimeFrame(globalTimeFrame.globalDate), [
        livestreams, globalTimeFrame
    ]);

    const futureStreams = useMemo(() => getFutureEvents(globalTimeFrame.globalDate), [
        livestreams, globalTimeFrame
    ]);

    const streamsFromTimeFrameAndFuture = useMemo(() => [...streamsFromTimeFrame, ...futureStreams], [
        futureStreams, streamsFromTimeFrame, globalTimeFrame
    ]);

    const getTabProps = () => {
        return {
            group,
            firebase,
            livestreams,
            futureStreams,
            globalTimeFrame,
            fetchingStreams: fetchingStreams || fetchingFollowers,
            streamsFromTimeFrame,
            showBar,
            streamDataType,
            setStreamDataType,
            handleToggleBar,
            streamDataTypes,
            streamsFromBeforeTimeFrame,
            streamsFromTimeFrameAndFuture,
            globalTimeFrames,
            setGlobalTimeFrame,
            fetchingFollowers,
            totalFollowers,
            currentStream,
            setCurrentStream,
            userType,
            userTypes,
            setUserType,
            groupOptions
        }
    }


    return (
        <Fragment>
            <Box className={classes.title} p={3}>
                <Title
                    setGlobalTimeFrame={setGlobalTimeFrame}
                    globalTimeFrames={globalTimeFrames}
                    globalTimeFrame={globalTimeFrame}
                />
            </Box>
            <AppBar className={classes.appBar} position="sticky" color="default">
                <Tabs
                    value={value}
                    TabIndicatorProps={{className: classes.indicator}}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="full width tabs example"
                >
                    <Tab className={classes.tab} label="General"/>
                    <Tab className={classes.tab} label="Audience"/>
                    <Tab className={classes.tab} label="Feedback"/>
                </Tabs>
            </AppBar>
            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                disabled
                onChangeIndex={handleChangeIndex}
            >
                <SwipeablePanel value={value} index={0} dir={theme.direction}>
                    <General
                        {...getTabProps()}
                    />
                </SwipeablePanel>
                <SwipeablePanel value={value} index={1} dir={theme.direction}>
                    <Audience
                        {...getTabProps()}
                    />
                </SwipeablePanel>
                <SwipeablePanel value={value} index={2} dir={theme.direction}>
                    <Feedback
                        {...getTabProps()}
                    />
                </SwipeablePanel>
            </SwipeableViews>
        </Fragment>
    );
};

export default AnalyticsOverview;
