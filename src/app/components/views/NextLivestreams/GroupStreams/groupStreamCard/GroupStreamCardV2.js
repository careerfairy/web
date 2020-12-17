import React, {Fragment, memo, useEffect, useMemo, useRef, useState} from 'react';
import {withFirebase} from "context/firebase";
import {makeStyles} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../../../util/constants";
import {Avatar, Box, Button, ClickAwayListener, Collapse, fade, Fade, Grow, Paper} from "@material-ui/core";
import {AvatarGroup} from "@material-ui/lab";
import Streamers from "./Streamers";
import Wave from "./Wave";
import Typography from "@material-ui/core/Typography";
import LogoElement from "../LogoElement";
import TargetOptions from "../../GroupsCarousel/TargetOptions";
import UserUtil from "../../../../../data/util/UserUtil";
import DataAccessUtil from "../../../../../util/DataAccessUtil";
import {useRouter} from "next/router";
import GroupJoinToAttendModal from "../GroupJoinToAttendModal";
import BookingModal from "../../../common/booking-modal/BookingModal";
import CopyToClipboard from "../CopyToClipboard";
import {AttendButton, DetailsButton} from "./actionButtons";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import {DateDisplay, TimeDisplay} from "./TimeDisplay";
import EnhancedGroupStreamCard from "../../../group/admin/events/enhanced-group-stream-card/EnhancedGroupStreamCard";
import SettingsIcon from '@material-ui/icons/Settings';

const useStyles = makeStyles((theme) => {
    const transition = `transform ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`
    const paperColor = theme.palette.background.paper
    const frontHoveredScale = 0.7
    const dateHeight = 100
    const themeColor = theme.palette.primary.main
    return ({
        root: {
            width: "100%",
            height: "100%",
            display: "flex",
        },
        streamCard: {
            display: "flex",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            position: "relative",
            webKitPosition: "relative",
            transitionProperty: "transform",
            transitionDuration: `${theme.transitions.duration.shorter}ms`,
            transitionTimingFunction: theme.transitions.easing.easeInOut,
            zIndex: ({cardHovered}) => cardHovered && 1002,
            "& p": {
                color: theme.palette.common.white
            },
        },
        copyToClipBoard: {
            color: ({cardHovered}) => cardHovered && theme.palette.common.white,
            position: 'absolute',
            top: 0,
            right: 0,
            fontWeight: 'bold',
            fontSize: '1.125rem',
            padding: '0.5em 0.5em 0.75em',
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        companyLogo: {
            maxWidth: "70%",
            maxHeight: "65%"
        },
        companyLogoWrapper: {
            position: "relative",
            height: 140,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: ({cardHovered}) => cardHovered && `${theme.spacing(2)}px 0px`,
            background: fade(paperColor, 1),
            boxShadow: ({cardHovered}) => cardHovered && theme.shadows[24]
        },
        dateTimeWrapper: {
            display: "flex",
            width: "100%",
            height: dateHeight,
            color: theme.palette.common.white,
        },
        dateWrapper: {
            width: "50%",
            height: "100%",
            display: "flex",
            alignItems: "flex-end"
        },
        timeWrapper: {
            width: "50%",
            height: "100%",
            display: "flex",
            alignItems: "flex-end"
        },
        companyName: {
            marginTop: `${theme.spacing(3)}px !important`,
            marginBottom: `${theme.spacing(3)}px !important`,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            width: ({cardHovered}) => cardHovered && "140%",
            transition: "width 1s",
            padding: `0 ${theme.spacing(1)}px`,
            color: "white !important",
            // zIndex: 1,
            justifyContent: "center"
        },
        front: {
            position: "relative",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            transform: ({
                            cardHovered,
                            hasOptions
                        }) => cardHovered && `translateY(${hasOptions ? -90 : -60}px) scale(${frontHoveredScale})`,
            transition: '250ms',
            background: ({
                             cardHovered,
                             registered
                         }) => cardHovered ? "transparent" : registered ? theme.palette.primary.dark : theme.palette.navyBlue.main,
            boxShadow: ({cardHovered}) => cardHovered && "none",
            height: ({cardHovered}) => cardHovered && "fit-content",
            borderRadius: ({expanded}) => expanded ? `${theme.spacing(2.5)}px` : theme.spacing(2.8),

        },
        speakersAndLogosWrapper: {
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomRightRadius: `${theme.spacing(2.5)}px !important`,
            borderBottomLeftRadius: `${theme.spacing(2.5)}px !important`,
            zIndex: 1,
        },
        companyLogosFrontWrapper: {
            boxShadow: ({isExpanded}) => isExpanded && theme.shadows[24],
            background: "white",
            padding: theme.spacing(1),
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            borderRadius: "inherit",
            // zIndex: 1,
            flex: ({mobile}) => mobile && 1,
            maxHeight: 125
        },

        optionsWrapper: {
            overflowX: 'hidden',
            overflowY: 'auto',
            maxHeight: 100,
        },
        expandedOptionsWrapper: {
            overflowX: 'hidden',
            overflowY: 'auto',
            maxHeight: "40vh",
            padding: ({hasGroups}) => theme.spacing(!hasGroups ? 4 : 2),
            paddingTop: 0,
        },
        background: {
            transition: ({cardHovered}) => cardHovered && `${transition}, opacity 150ms linear`,
            transform: ({
                            cardHovered,
                            hasOptions
                        }) => cardHovered ? 'scale(1.1, 1.1)' : 'scale(0.2, 0.9)',
            opacity: ({cardHovered}) => cardHovered ? 1 : 0,
            background: theme.palette.navyBlue.main,
            position: 'absolute',
            top: '0',
            left: 0,
            right: 0,
            minHeight: "100%",
            zIndex: '-1',
            overflow: 'hidden',
            borderRadius: theme.spacing(2),
            boxShadow: theme.shadows[24],
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        },
        backgroundContent: {
            marginTop: ({hideActions, hasOptions}) => hideActions ? hasOptions ? "60%" : "70%" : 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1005,
            padding: theme.spacing(1),
            paddingTop: 0
        },
        buttonsWrapper: {
            marginTop: ({hasOptions}) => hasOptions ? "60%" : "70%",
            display: "flex",
            justifyContent: "center",
            marginBottom: theme.spacing(1),
            flexWrap: "wrap"
        },
        logosBackWrapper: {
            display: "flex",
            width: "100%",
            background: paperColor,
            overflowX: "auto",
            overflowY: "hidden",
        },
        logoElement: {
            display: "flex",
            alignItems: "center",
            margin: "0 auto",
            padding: `${theme.spacing(1)}px ${theme.spacing(0.5)}px`,
            height: ({cardHovered}) => !cardHovered && 90
        },
        backgroundImage: {
            position: "absolute",
            opacity: '.3',
            clipPath: 'url(#wave)',
            height: '45%',
            width: '100%',
            objectFit: 'cover',
        },
        lowerFrontContent: {
            display: "flex",
            flex: 1,
            position: "relative",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            borderRadius: theme.spacing(2.5),
        },
        lowerFrontBackgroundImage: {
            borderRadius: "inherit",
            position: "absolute",
            opacity: '.3',
            height: '100%',
            width: '100%',
            objectFit: 'cover',
        },
        bookedIcon: {
            color: "white",
            position: "absolute",
            left: theme.spacing(1),
            top: 5,
            display: "flex",
            alignItems: "center"
        },
        bookedText: {
            marginLeft: theme.spacing(1),
            fontWeight: "bold",
            color: theme.palette.primary.main
        },
        expandArea: {
            borderRadius: ({hasGroups}) => !hasGroups && theme.spacing(2.5),
            border: ({hasGroups}) => !hasGroups && "1px solid black",
            marginTop: theme.spacing(1),
            background: ({registered}) => registered ? theme.palette.primary.dark : theme.palette.navyBlue.main,
            color: "white",
            width: "100%",
            "& p": {
                color: "white !important"
            },
        },
        optionChips: {
            borderColor: "white",
            background: "none !important"
        },
        expandButton: {
            color: ({isAdmin}) => !isAdmin && theme.palette.common.white,
            borderRadius: ({hasGroups, isAdmin}) => isAdmin && hasGroups ? 0 : theme.spacing(2.5),
        },
        actionButtonsWrapper: {
            marginTop: theme.spacing(1)
        },
        titleAndSpeakersWrapper: {
            flex: 1,
            display: "flex",
            justifyContent: ({cardHovered}) => !cardHovered && "space-evenly",
            flexDirection: "column",
            alignItems: "center"
        },
        pulseAnimate: {
            animation: `$pulse 1s infinite`
        },
        "@keyframes pulse": {
            "0%": {
                borderRadius: theme.spacing(2.5),
                MozBoxShadow: `0 0 0 0 ${fade(themeColor, 1)}`,
                boxShadow: `0 0 0 0 ${fade(themeColor, 1)}`
            },
            "70%": {
                borderRadius: theme.spacing(2.5),
                MozBoxShadow: `0 0 0 15px ${fade(themeColor, 0)}`,
                boxShadow: `0 0 0 15px ${fade(themeColor, 0)}`
            },
            "100%": {
                borderRadius: theme.spacing(2.5),
                MozBoxShadow: `0 0 0 0 ${fade(themeColor, 0)}`,
                boxShadow: `0 0 0 0 ${fade(themeColor, 0)}`
            }
        },
    })
})

const GroupStreamCardV2 = memo(({
                                    livestream,
                                    user,
                                    mobile,
                                    userData,
                                    firebase,
                                    livestreamId,
                                    id,
                                    careerCenterId,
                                    groupData,
                                    listenToUpcoming,
                                    hasCategories,
                                    index,
                                    width,
                                    setGlobalCardHighlighted,
                                    globalCardHighlighted,
                                    isAdmin,
                                    isPastLivestream,
                                    hideActions,
                                    isDraft,
                                    switchToNextLivestreamsTab
                                }) => {

    const router = useRouter();
    const absolutePath = router.asPath
    const linkToStream = listenToUpcoming ? `/next-livestreams?livestreamId=${livestream.id}` : `/next-livestreams?careerCenterId=${groupData.groupId}&livestreamId=${livestream.id}`
    const frontRef = useRef()

    function userIsRegistered() {
        if (!user || !livestream.registeredUsers || isAdmin) {
            return false;
        }
        return Boolean(livestream.registeredUsers?.indexOf(user.email) > -1)
    }

    const registered = useMemo(() => userIsRegistered(), [livestream.registeredUsers])
    const [expanded, setExpanded] = useState(false);

    const [cardHovered, setCardHovered] = useState(false)
    const [frontHeight, setFrontHeight] = useState(0);
    const [targetOptions, setTargetOptions] = useState([])
    const [careerCenters, setCareerCenters] = useState([])
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false)
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [levelOfStudyModalOpen, setLevelOfStudyModalOpen] = useState(false);

    const classes = useStyles({
        hideActions,
        isHighlighted,
        cardHovered,
        mobile,
        hasGroups: careerCenters.length,
        registered,
        isExpanded: expanded,
        expanded: expanded && targetOptions.length,
        frontHeight,
        isAdmin,
        hasOptions: targetOptions.length
    })


    useEffect(() => {
        if (frontRef.current?.offsetHeight) {
            setFrontHeight(frontRef.current.offsetHeight * 0.7)
        }
    }, [frontRef.current])





    useEffect(() => {
        if (checkIfHighlighted() && !isHighlighted && frontHeight) {
            setIsHighlighted(true)
            setGlobalCardHighlighted(true)
            if (mobile) {
                setExpanded(true)
            } else {
                setCardHovered(true)
            }
        } else if (checkIfHighlighted() && isHighlighted) {
            setIsHighlighted(false)
        }
    }, [livestreamId, id, careerCenterId, groupData.groupId, frontHeight]);

    useEffect(() => {
        if (groupData.categories && livestream.targetCategories) {
            const {groupId, categories} = groupData
            let totalOptions = []
            categories.forEach(category => totalOptions.push(category.options))
            const flattenedOptions = totalOptions.reduce(function (a, b) {
                return a.concat(b);
            }, []);
            const matchedOptions = livestream.targetCategories[groupId]
            if (matchedOptions) {
                const filteredOptions = flattenedOptions.filter(option => matchedOptions.includes(option.id))
                setTargetOptions(filteredOptions)
            }
        }
    }, [groupData, livestream])

    useEffect(() => {
        if (!careerCenters.length && livestream && livestream.groupIds && livestream.groupIds.length) {
            firebase.getDetailLivestreamCareerCenters(livestream.groupIds)
                .then((querySnapshot) => {
                    let groupList = [];
                    querySnapshot.forEach((doc) => {
                        let group = doc.data();
                        group.id = doc.id;
                        groupList.push(group);
                    });
                    setCareerCenters(groupList);
                }).catch((e) => console.log("error", e))
        }
    }, []);


    const handleCloseLevelOfStudyModal = () => {
        setLevelOfStudyModalOpen(false)
    }
    const handleOpenLevelOfStudyModal = () => {
        setLevelOfStudyModalOpen(true)
    }

    const handleMouseEntered = () => {
        if (!mobile && !cardHovered && !globalCardHighlighted) {
            setCardHovered(true)
        }
    }

    const handleMouseLeft = () => {
        if (isHighlighted) {
            setGlobalCardHighlighted(false)
        }
        cardHovered && setCardHovered(false)
    }

    const checkIfHighlighted = () => {
        if (careerCenterId && livestreamId && id && livestreamId === id && groupData.groupId === careerCenterId) {
            return true
        } else return livestreamId && !careerCenterId && !groupData.id && livestreamId === id;
    }

    const checkIfUserFollows = (careerCenter) => {
        if (user && userData && userData.groupIds) {
            const {groupId} = careerCenter
            return userData.groupIds.includes(groupId)
        } else {
            return false
        }
    }

    function deregisterFromLivestream() {
        if (!user) {
            return router.push({
                pathname: '/login',
                query: {absolutePath}
            });
        }

        firebase.deregisterFromLivestream(livestream.id, user.email);
    }

    function startRegistrationProcess() {
        if (!user || !user.emailVerified) {
            return router.push({
                pathname: `/login`,
                query: {absolutePath: linkToStream},
            });
        }

        if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            return router.push({
                pathname: '/profile',
                query: "profile"
            });
        }
        if (listenToUpcoming) {// If on next livestreams tab...
            if (!userFollowingAnyGroup() && livestream.groupIds?.length) {
                setOpenJoinModal(true)
            } else {
                firebase.registerToLivestream(livestream.id, user.email).then(() => {
                    setCardHovered(false)
                    setBookingModalOpen(true);
                    sendEmailRegistrationConfirmation();
                })
            }
        } else { // if on any other tab that isn't next livestreams...
            if (!userFollowingCurrentGroup()) {
                setOpenJoinModal(true)
            } else {
                firebase.registerToLivestream(livestream.id, user.email).then(() => {
                    setCardHovered(false)
                    setBookingModalOpen(true);
                    sendEmailRegistrationConfirmation();
                })
            }
        }

    }

    function completeRegistrationProcess() {
        firebase.registerToLivestream(livestream.id, user.email).then(() => {
            setCardHovered(false)
            setBookingModalOpen(true);
            sendEmailRegistrationConfirmation();
        })
    }

    function handleCloseJoinModal() {
        setOpenJoinModal(false);
    }

    function sendEmailRegistrationConfirmation() {
        return DataAccessUtil.sendRegistrationConfirmationEmail(user, userData, livestream);
    }

    const userFollowingAnyGroup = () => {
        if (userData.groupIds && livestream.groupIds) { // are you following any group thats part of this livstream?
            return userData.groupIds.some(id => livestream.groupIds.indexOf(id) >= 0)
        } else {
            return false
        }
    }

    const userFollowingCurrentGroup = () => {
        if (userData.groupIds && groupData.groupId) { // Are you following the group in group tab?
            return userData.groupIds.includes(groupData.groupId)
        } else {
            return false
        }
    }

    const handleRegisterClick = () => {
        if (user && livestream.registeredUsers?.indexOf(user.email) > -1) {
            deregisterFromLivestream()
        } else {
            startRegistrationProcess()
        }
    }

    const checkIfRegistered = () => {
        if(isAdmin){
            return false
        }
        return Boolean(livestream.registeredUsers?.indexOf(user.email) > -1)
    }


    const getGroups = () => {
        if (groupData.groupId) {
            return [groupData]
        } else {
            return careerCenters
        }
    }

    const isNarrow = () => {
        return Boolean((width === "md" && hasCategories)|| isAdmin)
    }

    const handlePulseFront = () => {
        return isHighlighted && !cardHovered && classes.pulseAnimate
    }
    const handlePulseBackground = () => {
        return isHighlighted && cardHovered && classes.pulseAnimate
    }

    let logoElements = careerCenters.map(careerCenter => {
        return (
            <div className={classes.logoElement} key={careerCenter.groupId}>
                <LogoElement hideFollow={(!cardHovered && !mobile)|| isAdmin} key={careerCenter.groupId}
                             livestreamId={livestream.id}
                             userFollows={checkIfUserFollows(careerCenter)}
                             careerCenter={careerCenter} userData={userData} user={user}/>
            </div>
        );
    })

    let speakerElements = livestream.speakers?.map(speaker => {
        return (<Avatar
            key={speaker.id}
            src={speaker.avatar || speakerPlaceholder}
            alt={speaker.firstName}/>)
    })

    const handleClickAwayDetails = () => {
        if (expanded && !levelOfStudyModalOpen) {
            setExpanded(false)
        }
        if (cardHovered) {
            setCardHovered(false)
        }
    }

    return (
        <Fragment>
            <ClickAwayListener onClickAway={handleClickAwayDetails}>
                <div
                    className={classes.root}>
                    <Box
                        onMouseEnter={handleMouseEntered}
                        onMouseLeave={handleMouseLeft}
                        classes={{
                            root: handlePulseFront()
                        }}
                        className={classes.streamCard}>
                        <Paper
                            ref={frontRef}
                            elevation={4}
                            className={classes.front}>
                            {!cardHovered &&
                            <img className={classes.lowerFrontBackgroundImage} src={livestream.backgroundImageUrl}
                                 alt="background"/>}
                            <div className={classes.dateTimeWrapper}>
                                <div className={classes.dateWrapper}>
                                    <DateDisplay mobile={mobile} narrow={isNarrow()} date={livestream.start.toDate()}/>
                                </div>
                                <div className={classes.timeWrapper}>
                                    <TimeDisplay mobile={mobile} narrow={isNarrow()} date={livestream.start.toDate()}/>
                                </div>
                            </div>
                            <div className={classes.companyLogoWrapper}>
                                <Grow in={Boolean(userIsRegistered())}>
                                    <div className={classes.bookedIcon}>
                                        <CheckCircleRoundedIcon color="primary"/>
                                        <Typography variant="h6" className={classes.bookedText}>
                                            Booked
                                        </Typography>
                                    </div>
                                </Grow>
                                {mobile &&
                                <CopyToClipboard
                                    color={cardHovered && "white"}
                                    className={classes.copyToClipBoard}
                                    value={linkToStream}/>}
                                <img className={classes.companyLogo} src={livestream.companyLogoUrl} alt=""/>
                            </div>

                            <div className={classes.lowerFrontContent}>
                                <div className={classes.speakersAndLogosWrapper}>
                                    <div className={classes.titleAndSpeakersWrapper}>
                                        <Typography variant={mobile ? "h6" : cardHovered ? "h4" : "h5"} align="center"
                                                    className={classes.companyName}>
                                            {livestream.title}
                                        </Typography>
                                        {!cardHovered &&
                                        <>
                                            {expanded ?
                                                <Streamers speakers={livestream.speakers} cardHovered={expanded}/>
                                                :
                                                <AvatarGroup max={3}>
                                                    {speakerElements}
                                                </AvatarGroup>}
                                        </>}
                                    </div>
                                    {!cardHovered &&
                                    <>
                                        {mobile && !hideActions &&
                                        <div className={classes.actionButtonsWrapper}>
                                            <DetailsButton
                                                size="small"
                                                groupData={groupData}
                                                listenToUpcoming={listenToUpcoming}
                                                livestream={livestream}/>
                                            <AttendButton
                                                size="small"
                                                handleRegisterClick={handleRegisterClick}
                                                checkIfRegistered={checkIfRegistered}
                                                user={user}/>
                                        </div>}
                                        {mobile &&
                                        <div className={classes.expandArea}>
                                            <Button className={classes.expandButton}
                                                    startIcon={isAdmin && <SettingsIcon/>}
                                                    variant={isAdmin && "contained"}
                                                    onClick={() => setExpanded(!expanded)}
                                                    fullWidth>
                                                {expanded ? "Show less" : isAdmin ? "Manage Stream" : "See more"}
                                            </Button>
                                            <Collapse mountOnEnter in={expanded}>
                                                {isAdmin &&
                                                <EnhancedGroupStreamCard
                                                    isPastLivestream={isPastLivestream}
                                                    group={groupData}
                                                    isDraft={isDraft}
                                                    router={router}
                                                    switchToNextLivestreamsTab={switchToNextLivestreamsTab}
                                                    handleOpenLevelOfStudyModal={handleOpenLevelOfStudyModal}
                                                    handleCloseLevelOfStudyModal={handleCloseLevelOfStudyModal}
                                                    levelOfStudyModalOpen={levelOfStudyModalOpen}
                                                    livestream={livestream}
                                                    firebase={firebase}/>}
                                                {!!targetOptions.length &&
                                                <div className={classes.expandedOptionsWrapper}>
                                                    <TargetOptions className={classes.optionChips}
                                                                   options={targetOptions}/>
                                                </div>}
                                            </Collapse>
                                        </div>}
                                        <Grow in={Boolean(logoElements.length)}>
                                            <div className={classes.companyLogosFrontWrapper}>
                                                {logoElements}
                                            </div>
                                        </Grow>
                                    </>
                                    }
                                </div>
                            </div>
                        </Paper>
                        <ClickAwayListener onClickAway={handleMouseLeft}>
                            <Box
                                className={classes.background}
                                classes={{
                                    root: handlePulseBackground()
                                }}>
                                <img className={classes.backgroundImage} src={livestream.backgroundImageUrl}
                                     alt="background"/>
                                <CopyToClipboard
                                    color="white"
                                    className={classes.copyToClipBoard}
                                    value={linkToStream}/>
                                {!hideActions && <div className={classes.buttonsWrapper}>
                                    <DetailsButton
                                        groupData={groupData}
                                        listenToUpcoming={listenToUpcoming}
                                        livestream={livestream}/>
                                    <AttendButton
                                        handleRegisterClick={handleRegisterClick}
                                        checkIfRegistered={checkIfRegistered}
                                        user={user}/>
                                </div>}
                                <div className={classes.backgroundContent}>
                                    <Streamers speakers={livestream.speakers} cardHovered={cardHovered}/>
                                    {!!targetOptions.length &&
                                    <div className={classes.optionsWrapper}>
                                        <TargetOptions className={classes.optionChips}
                                                       options={targetOptions}/>
                                    </div>}
                                </div>
                                <div className={classes.logosBackWrapper}>
                                    {logoElements}
                                </div>
                            </Box>
                        </ClickAwayListener>
                    </Box>
                </div>
            </ClickAwayListener>
            <Wave/>
            <GroupJoinToAttendModal
                open={openJoinModal}
                groups={getGroups()}
                alreadyJoined={false}
                userData={userData}
                onConfirm={completeRegistrationProcess}
                closeModal={handleCloseJoinModal}/>
            <BookingModal
                livestream={livestream}
                modalOpen={bookingModalOpen}
                setModalOpen={setBookingModalOpen}
                user={user}/>
        </Fragment>
    )
})


export default withFirebase(GroupStreamCardV2);
