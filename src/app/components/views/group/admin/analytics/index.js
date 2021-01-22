import React, {Fragment, useEffect, useMemo, useRef, useState} from "react";
import {fade, makeStyles} from "@material-ui/core";
import {v4 as uuid} from 'uuid';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import General from "./General";
import {useTheme} from "@material-ui/core/styles";
import {SwipeablePanel} from "../../../../../materialUI/GlobalPanels/GlobalPanels";
import Audience from "./Audience";
import Title from "./Title";
import Box from "@material-ui/core/Box";
import {
    handleFlattenOptions,
    handleFlattenOptionsWithoutLvlOfStudy
} from "../../../../helperFunctions/streamFormFunctions";
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
        propertyName: "talentPool",
        displayName: "Talent Pool",
        propertyDataName: "talentPoolData",
        universityPropertyDataName: "universityTalentPoolData"
    },
    {
        propertyName: "registeredUsers",
        displayName: "Registered Users",
        propertyDataName: "registeredUsersData",
        universityPropertyDataName: "universityRegisteredUsersData"
    },
    {
        propertyName: "participatingStudents",
        displayName: "Participating Students",
        propertyDataName: "participatingStudentsData",
        universityPropertyDataName: "universityParticipatingStudentsData"
    },
]

const streamDataTypes = [
    {
        propertyName: "questions",
        displayName: "Questions",
    },
    {
        propertyName: "pollEntries",
        displayName: "Polls",
    },
    {
        propertyName: "feedback",
        displayName: "Feedback",
    }]


const AnalyticsOverview = ({firebase, group}) => {
    const userDataSets = [
        {
            id: uuid(),
            dataSet: "groupUniversityStudents",
            displayName: `${group.universityName} students`,
            miscName: `Only ${group.universityName} students`
        },
        {
            id: uuid(),
            dataSet: "followers",
            displayName: "Subscribed students",
            miscName: "All subscribed students"
        },
    ]

    if (!group.universityCode) {
        userDataSets.shift()
    }

    const classes = useStyles();
    const breakdownRef = useRef(null)
    const theme = useTheme()
    const [value, setValue] = useState(0);

    const [globalTimeFrame, setGlobalTimeFrame] = useState(globalTimeFrames[2]);
    const [showBar, setShowBar] = useState(false);
    const [livestreams, setLivestreams] = useState([]);
    const [fetchingStreams, setFetchingStreams] = useState(false);
    const [userType, setUserType] = useState(userTypes[0]);
    const [streamDataType, setStreamDataType] = useState(streamDataTypes[0]);
    const [groupOptions, setGroupOptions] = useState([]);
    const [currentStream, setCurrentStream] = useState(null);
    const [fetchingFollowers, setFetchingFollowers] = useState(false);
    const [totalFollowers, setTotalFollowers] = useState(null);
    const [groupOptionsWithoutLvlOfStudy, setGroupOptionsWithoutLvlOfStudy] = useState([]);
    const [fetchingQuestions, setFetchingQuestions] = useState(false);
    const [fetchingRatings, setFetchingRatings] = useState(false);
    const [fetchingPolls, setFetchingPolls] = useState(false);
    const [limitedUserTypes, setLimitedUserTypes] = useState(userTypes);
    const [totalStudentsOfGroupUniversity, setTotalStudentsOfGroupUniversity] = useState(null);
    const [fetchingStudentsOfGroupUniversity, setFetchingStudentsOfGroupUniversity] = useState(false);
    const [currentUserDataSet, setCurrentUserDataSet] = useState(userDataSets[0]);

    useEffect(() => {
        if (currentUserDataSet.dataSet === "followers") {
            const limitedUserTypes = userTypes.filter(({propertyName}) => propertyName === "talentPool")
            setLimitedUserTypes(limitedUserTypes)
        } else {
            setLimitedUserTypes(userTypes)
        }
    }, [currentUserDataSet.dataSet])

    useEffect(() => {
        const flattenedGroupOptions = handleFlattenOptions(group)
        const flattenedGroupOptionsWithoutLvlOfStudy = handleFlattenOptionsWithoutLvlOfStudy(group)
        setGroupOptionsWithoutLvlOfStudy(flattenedGroupOptionsWithoutLvlOfStudy)
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
        (async function () {
            if (group.universityCode) {
                setFetchingStudentsOfGroupUniversity(true);
                const snapshots = await firebase.getStudentsOfGroupUniversity(group.universityCode)
                const uniStudentsData = snapshots.docs.map(doc => ({id: doc.id, ...doc.data()}))
                setTotalStudentsOfGroupUniversity(uniStudentsData);
                setFetchingStudentsOfGroupUniversity(false);
            } else {
                setTotalStudentsOfGroupUniversity([])
            }
        })()
    }, [group.id, group.universityCode]);


    useEffect(() => {
        if (totalFollowers && totalStudentsOfGroupUniversity) {
            setFetchingStreams(true);
            const unsubscribe = firebase.listenToAllLivestreamsOfGroup(
                group.id,
                (snapshots) => {
                    const userDataSet = getUserDataset()
                    const livestreamsData = snapshots.docs.map(snap => {
                        const livestream = snap.data()
                        livestream.id = snap.id
                        livestream.date = livestream.start?.toDate()
                        for (const userType of userTypes) {
                            if (currentUserDataSet.dataSet === "groupUniversityStudents") {// Change the graph and status data if we're looking at the groups university Students
                                livestream[userType.propertyName] = livestream[userType.propertyName].filter(userEmail => {
                                    return userDataSet?.some(userData => userData.userEmail === userEmail)
                                })
                            }
                            livestream[userType.propertyDataName] = userDataSet.filter(userData => {
                                return livestream[userType.propertyName]?.some(userEmail => userEmail === userData.userEmail)
                            })
                        }
                        return livestream
                    })
                    setLivestreams(livestreamsData.reverse())
                    setFetchingStreams(false)
                }, new Date(globalTimeFrame.double)
            );
            return () => unsubscribe();
        }
    }, [globalTimeFrame, group.id, totalFollowers, currentUserDataSet, totalStudentsOfGroupUniversity]);

    useEffect(() => {
        if (currentStream?.id) {
            setFetchingPolls(true)
            const unsubscribePolls = firebase.listenToPollEntries(currentStream.id, querySnapshot => {
                const pollEntries = querySnapshot.docs.map(doc => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        date: data.timestamp?.toDate(),
                        votes: data.voters?.length || 0,
                        ...data
                    }
                })
                setCurrentStream(prevState => ({...prevState, pollEntries}));
                setFetchingPolls(false)
            });
            return () => unsubscribePolls();
        }
    }, [currentStream?.id])

    useEffect(() => {
        if (currentStream?.id) {
            setFetchingQuestions(true)
            const unsubscribeQuestions = firebase.listenToLivestreamQuestions(currentStream.id, querySnapshot => {
                const questions = querySnapshot.docs.map(doc => {
                    const questionData = doc.data()
                    const userDataSet = getUserDataset()
                    const authorData = userDataSet.find(follower => follower.userEmail === questionData.author)
                    return {
                        id: doc.id,
                        ...questionData,
                        date: questionData.timestamp?.toDate(),
                        authorData
                    }
                })
                setCurrentStream(prevState => ({...prevState, questions}));
                setFetchingQuestions(false)
            });
            return () => unsubscribeQuestions();
        }
    }, [currentStream?.id])

    useEffect(() => {
        if (currentStream?.id) {
            const unsubscribeRatings = firebase.listenToLivestreamRatings(currentStream.id, async querySnapshot => {
                const feedback = []
                for (const ratingDoc of querySnapshot.docs) {
                    const ratingData = ratingDoc.data()
                    ratingData.id = ratingDoc.id
                    const votersSnap = await firebase.getLivestreamRatingVoters(ratingDoc.id, currentStream.id)
                    const voters = votersSnap.docs.map(doc => ({
                        id: doc.id,
                        date: doc.data().timestamp.toDate(),
                        ...doc.data()
                    }))
                    const average = getAverageRating(voters)
                    feedback.push({...ratingData, voters, votes: voters.length, average: Number(average)})
                }
                setCurrentStream(prevState => ({...prevState, feedback}))
                setFetchingRatings(false)
            })

            return () => unsubscribeRatings()
        }
    }, [currentStream?.id])

    const getUserDataset = () => {
        return currentUserDataSet.dataSet === "followers" ? totalFollowers : totalStudentsOfGroupUniversity
    }

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


    const handleScrollToBreakdown = () => {
        if (breakdownRef.current) {
            breakdownRef.current.scrollIntoView({behavior: 'smooth', block: 'start'})
        }
    }

    const getAverageRating = (voters) => {
        const total = voters?.reduce((acc, curr) => acc + curr.rating, 0)
        return total ? Number(total / voters.length).toFixed(2) : 0
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

    const handleReset = () => {
        setCurrentStream(null)
        setUserType(userTypes[0])
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
    const isFollowers = useMemo(() => currentUserDataSet.dataSet === "followers", [
        currentUserDataSet
    ]);

    const getTabProps = () => {
        return {
            group,
            firebase,
            livestreams,
            futureStreams,
            globalTimeFrame,
            fetchingStreams: fetchingStreams || fetchingFollowers || fetchingStudentsOfGroupUniversity,
            streamsFromTimeFrame,
            showBar,
            streamDataType,
            setStreamDataType,
            isFollowers,
            fetchingPolls,
            fetchingQuestions,
            fetchingRatings,
            handleToggleBar,
            streamDataTypes,
            streamsFromBeforeTimeFrame,
            streamsFromTimeFrameAndFuture,
            globalTimeFrames,
            groupOptionsWithoutLvlOfStudy,
            setGlobalTimeFrame,
            fetchingFollowers,
            breakdownRef,
            limitedUserTypes,
            handleScrollToBreakdown,
            totalFollowers,
            totalStudentsOfGroupUniversity,
            fetchingStudentsOfGroupUniversity,
            currentUserDataSet,
            currentStream,
            setCurrentStream,
            userType,
            handleReset,
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
                    userDataSets={userDataSets}
                    currentUserDataSet={currentUserDataSet}
                    setCurrentUserDataSet={setCurrentUserDataSet}
                    globalTimeFrames={globalTimeFrames}
                    group={group}
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
