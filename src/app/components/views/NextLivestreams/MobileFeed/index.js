import React, {useEffect, useState} from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';

import {Box, Button, Grid, Typography} from "@material-ui/core";
import {withFirebase} from "../../../../context/firebase";
import GroupStreams from "../GroupStreams/GroupStreams";
import {useRouter} from "next/router";
import GroupJoinModal from "../../profile/GroupJoinModal";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import FiltersDrawer from "./FiltersDrawer";


const useStyles = makeStyles((theme) => ({
    streamsGrid: {
        height: "100%"
    },
    bar: {
        boxShadow: "none",
        position: "sticky",
        top: 0,
        zIndex: 1
    },
    panel: {
        minHeight: 300
    },
    followButton: {
        marginTop: 5,
        position: "sticky",
        top: 165,
        zIndex: 20
    },
    tabPanel: {},
    sticky: {
        zIndex: 1
    }
}));

function TabPanel({children, value, index, ...other}) {
    const classes = useStyles()
    return (
        <Box className={classes.tabPanel} p={1} {...other}>
            {children}
        </Box>
    );
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}


const MobileFeed = ({
                        handleToggleActive,
                        hasCategories,
                        groupData,
                        userData,
                        alreadyJoined,
                        livestreams,
                        searching,
                        scrollToTop,
                        livestreamId,
                        careerCenterId,
                        listenToUpcoming,
                        selectedOptions,
                        isPastLivestreams
                    }) => {
    const classes = useStyles();
    const theme = useTheme();
    const router = useRouter()
    const absolutePath = router.asPath
    const [value, setValue] = useState(0);
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [topOffset, setTopOffset] = useState(0);
    const matches = useMediaQuery(theme.breakpoints.up('sm'));

    useEffect(() => {
        const newOffset = matches ? theme.mixins.toolbar["@media (min-width:600px)"].minHeight : theme.mixins.toolbar.minHeight
        setTopOffset(newOffset)
    }, [matches])
    useEffect(() => {
        if (groupData) {
            handleResetView()
        }
    }, [groupData.universityName])

    useEffect(() => {
        scrollToTop()
    }, [value])


    const handleChange = (event, newValue) => {
        setValue(newValue);
    }

    const handleResetView = () => {
        setValue(0)
    }

    const handleChangeIndex = (index) => {
        if (index === 0 || index === 1) {
            setValue(index);
        }
    };

    const handleCloseJoinModal = () => {
        setOpenJoinModal(false);
    };
    const handleOpenJoinModal = () => {
        setOpenJoinModal(true);
    };

    const handleJoin = () => {
        if (userData) {
            handleOpenJoinModal()
        } else {
            return router.push({pathname: "/login", query: {absolutePath}})
        }
    }


    return (
        <Box p={2}>
            {!userData?.groupIds?.includes(groupData.groupId) && !listenToUpcoming &&
            <>
                <Button className={classes.followButton} onClick={handleJoin} size="large" variant="contained" fullWidth
                        color="primary" align="center">
                    <Typography variant="h5">Start Following {groupData.universityName}</Typography>
                </Button>
                <GroupJoinModal
                    open={openJoinModal}
                    group={groupData}
                    alreadyJoined={alreadyJoined}
                    userData={userData}
                    closeModal={handleCloseJoinModal}
                />
            </>
            }
            <Grid className={classes.streamsGrid} container spacing={2}>
                <GroupStreams
                    mobile={true}
                    livestreamId={livestreamId}
                    listenToUpcoming={listenToUpcoming}
                    careerCenterId={careerCenterId}
                    isPastLivestreams={isPastLivestreams}
                    selectedOptions={selectedOptions}
                    searching={searching}
                    livestreams={livestreams}
                    groupData={groupData}
                />
            </Grid>
            <FiltersDrawer
                groupData={groupData}
                hasCategories={hasCategories}
                handleToggleActive={handleToggleActive}
            />
        </Box>
    );
}

export default withFirebase(MobileFeed)
