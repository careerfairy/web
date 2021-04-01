import React, {Fragment, useEffect, useMemo, useRef, useState} from "react";
import {v4 as uuid} from 'uuid';
import SwipeableViews from 'react-swipeable-views';
import General from "./General";
import {fade, makeStyles, useTheme} from "@material-ui/core/styles";
import {SwipeablePanel} from "../../../../../materialUI/GlobalPanels/GlobalPanels";
import Audience from "./Audience";
import Title from "./Title";
import Feedback from "./Feedback";
import {universityCountriesMap} from "../../../../util/constants";
import {isEmpty, isLoaded, useFirestoreConnect, withFirestore} from "react-redux-firebase";
import {useDispatch, useSelector} from "react-redux";
import {useAuth} from "../../../../../HOCs/AuthProvider";
import * as actions from '../../../../../store/actions'
import {AppBar, Box, Tab, Tabs} from '@material-ui/core';
import AnalyticsUtil, {
    arraysOfIdsEqual,
    getTotalUniqueStreamGroupIdsFromStreams
} from "../../../../../data/util/AnalyticsUtil";
import GroupsUtil from "../../../../../data/util/GroupsUtil";
import {createSelector} from 'reselect'
import PollUtil from "../../../../../data/util/PollUtil";
import useTimeFrames from "../../../../custom-hook/useTimeFrames";
import useUserDataSet from "../../../../custom-hook/useUserDataSet";
import useUserDataSetDictionary from "../../../../custom-hook/useUserDataSetDictionary";
import {repositionElement} from "../../../../helperFunctions/HelperFunctions";

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
    },
    slide: {
        // background: `linear-gradient(45deg, ${theme.palette.primary.main} 45%, ${fade(theme.palette.secondary.main, 1)} 75%)`
    }
}));

const now = new Date()

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
        displayName: "Participating Users",
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

const streamsSelector = createSelector(
    livestreams => livestreams,
    (_, {userDataSetDictionary}) => userDataSetDictionary,
    (_, {streamsMounted}) => streamsMounted,
    (_, {setStreamsMounted}) => setStreamsMounted,
    (livestreams, userDataSetDictionary, streamsMounted, setStreamsMounted) => {
        let streams = []
        if (livestreams) {
            streams = livestreams.map(streamObj => {
                const livestream = {...streamObj}
                livestream.date = livestream.start?.toDate()
                for (const userType of userTypes) {
                    if (isLoaded(userDataSetDictionary) && !isEmpty((userDataSetDictionary))) {
                        livestream[userType.propertyName] = livestream[userType.propertyName]?.filter(userEmail => userDataSetDictionary?.[userEmail])
                    }
                    livestream[userType.propertyDataName] = livestream[userType.propertyName]?.map(userEmail => ({
                        ...userDataSetDictionary?.[userEmail],
                    }))
                }
                return livestream
            })
            if (!streamsMounted) {
                setStreamsMounted(true)
            }
        }
        return streams
    }
)
const AnalyticsOverview = ({firebase, group, firestore}) => {
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
            displayName: "Total engaged students",
            miscName: "Total engaged students"
        },
    ]

    if (!group.universityCode) {
        userDataSets.shift()
    }
    const {globalTimeFrames} = useTimeFrames()

    const dispatch = useDispatch()
    const classes = useStyles();
    const breakdownRef = useRef(null)
    const theme = useTheme()
    const [value, setValue] = useState(0);
    const {userData} = useAuth();
    const [globalTimeFrame, setGlobalTimeFrame] = useState(globalTimeFrames[2]);
    const [showBar, setShowBar] = useState(false);
    const [userType, setUserType] = useState(userTypes[0]);
    const [streamDataType, setStreamDataType] = useState(streamDataTypes[0]);
    const [groupOptions, setGroupOptions] = useState([]);
    const [currentStream, setCurrentStream] = useState(null);
    const [fetchingQuestions, setFetchingQuestions] = useState(false);
    const [fetchingRatings, setFetchingRatings] = useState(false);
    const [fetchingPolls, setFetchingPolls] = useState(false);
    const [limitedUserTypes, setLimitedUserTypes] = useState(userTypes);
    const [currentUserDataSet, setCurrentUserDataSet] = useState(userDataSets[0]);
    const [streamsMounted, setStreamsMounted] = useState(false);
    const [groups, setGroups] = useState([]);

    const query = useMemo(() => [{
        collection: `livestreams`,
        where: [["start", ">", new Date(globalTimeFrame.double)], ["groupIds", "array-contains", group.id], ["test", "==", false]],
        orderBy: ["start", "asc"],
        storeAs: `livestreams of ${group.groupId}`
    }], [globalTimeFrame, group.groupId])

    useFirestoreConnect(query)
    const allGroups = useSelector(state => state.firestore.ordered?.allGroups)
    const allGroupsDictionary = useSelector(state => state.firestore.data?.allGroups)
    const uniStudents = useMemo(() => Boolean(currentUserDataSet.dataSet === "groupUniversityStudents"), [currentUserDataSet, group.id])
    const userDataSetDictionary = useUserDataSetDictionary(currentUserDataSet)
    const userDataSet = useUserDataSet(currentUserDataSet)

    const livestreams = useSelector(({firestore: {ordered}}) =>
        streamsSelector(ordered[`livestreams of ${group.groupId}`], {
            userDataSetDictionary,
            streamsMounted,
            setStreamsMounted
        })
    )

    useEffect(() => {
        return () => setStreamsMounted(false)
    }, [])

    useEffect(() => {
        if (uniStudents) {
            setGroups([{...group, options: GroupsUtil.handleFlattenOptions(group)}])
        } else if (allGroupsDictionary) {
            const streams = currentStream ? [currentStream] : streamsFromTimeFrameAndFuture
            let newGroupIds = getTotalUniqueStreamGroupIdsFromStreams(streams)
            const adminGroupIdIndex = newGroupIds.findIndex(groupId => groupId === group.id)
            if (adminGroupIdIndex > -1) {
                repositionElement(newGroupIds, adminGroupIdIndex, 0)
            }
            const areEqual = arraysOfIdsEqual(newGroupIds, groups.map(({groupId}) => groupId))

            if (!areEqual) {
                const newGroups = newGroupIds.map(groupId => {
                    const group = allGroupsDictionary[groupId]
                    return {...group, id: group.groupId, options: GroupsUtil.handleFlattenOptions(group)}
                })
                setGroups(newGroups)
            }

        }

    }, [streamsMounted, currentStream, allGroupsDictionary, uniStudents])

    useEffect(() => {
        if (group.universityCode) {
            (async function getStudents() {
                try {
                    await firestore.get({
                        collection: "userData",
                        where: [["university.code", "==", group.universityCode], ["groupIds", "array-contains", group.id]],
                        storeAs: "groupUniversityStudents",
                    })
                } catch (e) {
                    console.log("-> e in getting student", e);
                }
            })()
        }
    }, [group?.universityCode]);


    useEffect(() => {
        if (!allGroups) {
            (async function getAllGroups() {
                try {
                    await firestore.get({
                        collection: "careerCenterData",
                        storeAs: "allGroups",
                    })
                } catch (e) {
                    console.log("-> e in getting student", e);
                }
            })()
        }
    }, []);

    useEffect(() => {
        if (streamsMounted && !uniStudents && (!userDataSetDictionary || !userDataSet)) {
            (async function getTotalEngagedUsers() {
                try {
                    const totalIds = AnalyticsUtil.getTotalUniqueIds(livestreams)
                    const totalUsers = await firebase.getUsersByEmail(totalIds)
                    const dictionaryOfUsers = AnalyticsUtil.convertArrayOfUserObjectsToDictionary(totalUsers)
                    dispatch(actions.setOrderedUserDataSet(totalUsers))
                    dispatch(actions.setMapUserDataSet(dictionaryOfUsers))
                } catch (e) {
                    console.log("-> e in getting followers", e);
                }
            })()
        }
    }, [streamsMounted, uniStudents]);

    useEffect(() => {
        if (currentUserDataSet.dataSet === "followers" && !userData?.isAdmin) {
            const limitedUserTypes = userTypes.filter(({propertyName}) => propertyName === "talentPool")
            setLimitedUserTypes(limitedUserTypes)
        } else {
            setLimitedUserTypes(userTypes)
        }
    }, [currentUserDataSet.dataSet, userData])

    useEffect(() => {
        const flattenedGroupOptions = GroupsUtil.handleFlattenOptions(group)
        setGroupOptions(flattenedGroupOptions)
    }, [group])

    useEffect(() => {
        if (currentStream?.id) {
            setFetchingPolls(true)
            const unsubscribePolls = firebase.listenToPollEntries(currentStream.id, querySnapshot => {
                const pollEntries = querySnapshot.docs.map(doc => {
                    const data = doc.data()
                    return {
                        ...data,
                        id: doc.id,
                        date: data.timestamp?.toDate(),
                        votes: data.voters?.length || 0,
                        options: PollUtil.convertPollOptionsObjectToArray(data.options),
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
                    return {
                        id: doc.id,
                        ...questionData,
                        date: questionData.timestamp?.toDate(),
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
        const ratingVotes = voters.filter(voter => voter?.rating > 0)
        const total = ratingVotes?.reduce((acc, curr) => acc + curr.rating, 0)
        return total ? Number(total / ratingVotes.length).toFixed(2) : 0
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
        livestreams
    ]);

    const streamsFromBeforeTimeFrame = useMemo(() => getStreamsFromBeforeTimeFrame(globalTimeFrame.globalDate), [
        livestreams
    ]);

    const futureStreams = useMemo(() => getFutureEvents(globalTimeFrame.globalDate), [
        livestreams
    ]);

    const streamsFromTimeFrameAndFuture = useMemo(() => [...streamsFromTimeFrame, ...futureStreams], [
        futureStreams, streamsFromTimeFrame
    ]);
    const isFollowers = useMemo(() => currentUserDataSet.dataSet === "followers", [
        currentUserDataSet
    ]);

    const getTabProps = (tabName) => ({
        group,
        futureStreams,
        globalTimeFrame,
        loading: !isLoaded(livestreams) || !isLoaded(userDataSet),
        streamsFromTimeFrame,
        showBar,
        handleToggleBar,
        breakdownRef,
        handleScrollToBreakdown,
        currentStream,
        setCurrentStream,
        userType,
        userTypes,
        setUserType,
        groupOptions,
        ...(tabName !== "feedback" && {
            streamsFromTimeFrameAndFuture,
            handleReset
        }),
        ...(tabName === "feedback" && {
            streamDataTypes,
            fetchingRatings,
            fetchingQuestions,
            fetchingPolls,
            streamDataType,
            setStreamDataType,
        }),
        ...(tabName === "audience" && {
            isFollowers,
            limitedUserTypes,
            currentUserDataSet
        }),
        ...(tabName === "general" && {
            streamsFromBeforeTimeFrame,
            userDataSet,
            currentUserDataSet,
            groups
        }),
    })


    return (
        <Fragment>
            <Box className={classes.title} >
                <Title
                    setGlobalTimeFrame={setGlobalTimeFrame}
                    userDataSets={userDataSets}
                    streamsMounted={streamsMounted}
                    setStreamsMounted={setStreamsMounted}
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
                slideClassName={classes.slide}
                disabled
                onChangeIndex={handleChangeIndex}
            >
                <SwipeablePanel value={value} index={0} dir={theme.direction}>
                    <General
                        {...getTabProps("general")}
                    />
                </SwipeablePanel>
                <SwipeablePanel value={value} index={1} dir={theme.direction}>
                    <Audience
                        {...getTabProps("audience")}
                    />
                </SwipeablePanel>
                <SwipeablePanel value={value} index={2} dir={theme.direction}>
                    <Feedback
                        {...getTabProps("feedback")}
                    />
                </SwipeablePanel>
            </SwipeableViews>
        </Fragment>
    );
};

export default withFirestore(AnalyticsOverview);