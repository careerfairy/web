import React, {useEffect, useState, Fragment} from "react";
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
        background: "inherit",
        borderBottom: `1px solid ${fade(theme.palette.text.secondary, 0.3)}`
    }
}));


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

const AnalyticsOverview = ({firebase, group}) => {
    const classes = useStyles();
    const theme = useTheme()
    const [value, setValue] = useState(0);

    const [globalTimeFrame, setGlobalTimeFrame] = useState(globalTimeFrames[2]);
    const [livestreams, setLivestreams] = useState([]);
    const [fetchingStreams, setFetchingStreams] = useState(false);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    useEffect(() => {
        setFetchingStreams(true);
        const unsubscribe = firebase.listenToAllLivestreamsOfGroup(
            group.id,
            (snapshots) => {
                if (snapshots.empty) {
                    setFetchingStreams(false)
                    setLivestreams([])
                }
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
    }, [globalTimeFrame, group.id]);


    return (
        <Fragment>
            <Box p={3}>
                <Title
                    setGlobalTimeFrame={setGlobalTimeFrame}
                    globalTimeFrames={globalTimeFrames}
                    globalTimeFrame={globalTimeFrame}
                />
            </Box>
            <AppBar className={classes.appBar} position="static" color="default">
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
                onChangeIndex={handleChangeIndex}
            >
                <SwipeablePanel value={value} index={0} dir={theme.direction}>
                    <General
                        globalTimeFrame={globalTimeFrame}
                        fetchingStreams={fetchingStreams}
                        firebase={firebase}
                        group={group}
                        globalTimeFrames={globalTimeFrames}
                        livestreams={livestreams}
                        setGlobalTimeFrame={setGlobalTimeFrame}
                    />
                </SwipeablePanel>
                <SwipeablePanel value={value} index={1} dir={theme.direction}>
                    <Audience
                        globalTimeFrame={globalTimeFrame}
                        fetchingStreams={fetchingStreams}
                        firebase={firebase}
                        group={group}
                        globalTimeFrames={globalTimeFrames}
                        livestreams={livestreams}
                        setGlobalTimeFrame={setGlobalTimeFrame}
                    />
                </SwipeablePanel>
                <SwipeablePanel value={value} index={2} dir={theme.direction}>
                    Item Three
                </SwipeablePanel>
            </SwipeableViews>
        </Fragment>
    );
};

export default AnalyticsOverview;
