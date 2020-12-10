import React, {Fragment, memo, useEffect, useMemo, useRef, useState} from 'react';
import {withFirebase} from "context/firebase";
import {makeStyles} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../../../util/constants";
import {Avatar, Button, Collapse, Fade, Grow, Paper} from "@material-ui/core";
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


const useStyles = makeStyles((theme) => {
    const transition = `transform ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`
    const paperColor = theme.palette.background.paper
    const frontHoveredScale = 0.7
    const frontHoveredTranslate = -115
    const dateHeight = 100
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
            transform: ({
                            hoverLeft,
                            cardHovered
                        }) => cardHovered ? hoverLeft ? `translate(-25%)` : `translate(25%)` : "none",
            transitionProperty: "transform",
            transitionDuration: `${theme.transitions.duration.shorter}ms`,
            transitionTimingFunction: theme.transitions.easing.easeInOut,
            zIndex: ({cardHovered, openMoreDetails}) => (cardHovered || openMoreDetails) && 1002,
            "& p": {
                color: theme.palette.common.white
            },
        },
        copyToClipBoard: {
            color: ({cardHovered}) => cardHovered && theme.palette.common.white,
            position: 'absolute',
            top: 10,
            right: '0',
            zIndex: '999',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            padding: '0.5em 0.5em 0.75em',
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        companyLogo: {
            maxWidth: "100%",
            maxHeight: "65%"
        },
        logoTimeWrapper: {
            height: 200,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: ({cardHovered}) => cardHovered ? `${theme.spacing(2)}px 0px` : `${theme.spacing(2)}px ${theme.spacing(2)}px 0px 0px`,
            background: paperColor,
            boxShadow: ({cardHovered}) => cardHovered && theme.shadows[24]
        },
        dateTimeWrapper: {
            display: "flex",
            width: "100%",
            height: dateHeight,
            color: theme.palette.common.white
        },
        dateWrapper: {
            width: "63%",
            height: "100%",
            display: "flex",
            alignItems: "flex-end"
        },
        timeWrapper: {
            width: "37%",
            height: "100%",
            display: "flex",
            alignItems: "flex-end"
        },
        companyName: {
            marginTop: `${theme.spacing(2)}px !important`,
            marginBottom: `${theme.spacing(2)}px !important`,
            fontWeight: "bold",
            // fontSize: theme.spacing(3.5),
            // textAlign: 'center',
            display: "flex",
            alignItems: "center",
            width: ({cardHovered}) => cardHovered && "200%",
            height: ({cardHovered}) => cardHovered ? "auto" : 60,
            padding: `0 ${theme.spacing(1)}px`,
            color: "white !important",
            zIndex: 1,
            justifyContent: "center"
        },
        front: {
            position: "relative",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: ({cardHovered}) => cardHovered && `translateY(${frontHoveredTranslate}px) scale(${frontHoveredScale})`,
            transition: '250ms',
            background: ({
                             cardHovered,
                             registered
                         }) => cardHovered ? "transparent" : registered ? theme.palette.primary.dark : theme.palette.navyBlue.main,
            boxShadow: ({cardHovered}) => cardHovered && "none",
            height: ({cardHovered, frontHeight}) => cardHovered ? frontHeight : "100%",
            borderRadius: ({expanded}) => expanded ? `${theme.spacing(2.5)}px ${theme.spacing(2.5)}px 0 0` : theme.spacing(2.8),

        },
        speakersAndLogosWrapper: {
            flex: 1,
            opacity: ({cardHovered}) => cardHovered && 0,
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
            boxShadow: ({expanded}) => expanded && theme.shadows[24],
            background: "white",
            padding: theme.spacing(1),
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            borderRadius: "inherit",
            zIndex: 1,
            flex: ({mobile}) => mobile && 1,
        },
        buttonsWrapper: {
            marginTop: ({frontHeight}) => frontHeight / 2,
            display: "flex",
            justifyContent: "center",
            marginBottom: theme.spacing(1),
            flexWrap: "wrap"
        },
        optionsWrapper: {
            overflowX: 'hidden',
            overflowY: 'auto',
            maxHeight: "40vh",
        },
        expandedOptionsWrapper: {
            overflowX: 'hidden',
            overflowY: 'auto',
            maxHeight: "40vh",
            padding: ({hasGroups}) => theme.spacing(!hasGroups ? 4 : 2),
            paddingTop: 0,
        },
        background: {
            transition: ({cardHovered}) => cardHovered && `${transition}, opacity 250ms linear`,
            transform: ({cardHovered}) => cardHovered ? 'scale(1.35, 1.3) translateY(5%)' : 'scale(0.2, 0.9)',
            opacity: ({cardHovered}) => cardHovered ? 1 : 0,
            background: theme.palette.navyBlue.main,
            position: 'absolute',
            top: '0',
            bottom: "auto",
            zIndex: '-1',
            overflow: 'hidden',
            borderRadius: theme.spacing(2),
            boxShadow: theme.shadows[24],
            minWidth: "110%", // prevents single speaker cards from being too thin,

        },
        backgroundContent: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1005,
            padding: theme.spacing(2),
            paddingTop: 0
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
            height: '30%',
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
            // paddingBottom: ({isExpanded}) => isExpanded && theme.spacing(2)
        },
        lowerFrontBackgroundImage: {
            // paddingBottom: ({isExpanded}) => isExpanded && theme.spacing(4),
            borderBottomRightRadius: "inherit",
            borderBottomLeftRadius: "inherit",
            position: "absolute",
            opacity: '.3',
            height: '100%',
            width: '100%',
            objectFit: 'cover',
        },
        bookedIcon: {
            color: "white",
            position: "absolute",
            top: 5,
            left: 5,
            display: "flex",
            alignItems: "center"
        },
        bookedText: {
            marginLeft: theme.spacing(1),
            fontWeight: "bold"
        },
        expandArea: {
            borderRadius: ({hasGroups}) => !hasGroups && theme.spacing(2.5),
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
            color: theme.palette.common.white,
            borderRadius: ({hasGroups}) => !hasGroups && theme.spacing(2.5)
        },
        actionButtonsWrapper: {
            marginTop: theme.spacing(1)
        }
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
                                    width
                                }) => {

    const router = useRouter();
    const absolutePath = router.asPath
    const linkToStream = listenToUpcoming ? `/next-livestreams?livestreamId=${livestream.id}` : `/next-livestreams?careerCenterId=${groupData.groupId}&livestreamId=${livestream.id}`

    function userIsRegistered() {
        if (!user || !livestream.registeredUsers) {
            return false;
        }
        return Boolean(livestream.registeredUsers?.indexOf(user.email) > -1)
    }

    const shouldHoverLeft = () => {
        if (!hasCategories && width === "lg") {// only case when there's an odd number of cards in a row
            return (index + 1) % 3 === 0 // Please hover only the 3rd/last element in the row to the left
        } else {
            return (index + 1) % 2 === 0 // Please hover only the 2nd/4th/last even element in the row to the left
        }
    }

    const hoverLeft = useMemo(() => shouldHoverLeft(), [width, hasCategories])
    const registered = useMemo(() => userIsRegistered(), [livestream.registeredUsers])
    const [expanded, setExpanded] = useState(false);

    const [cardHovered, setCardHovered] = useState(false)
    const [openMoreDetails, setOpenMoreDetails] = useState(false)
    const [frontHeight, setFrontHeight] = useState(0);
    const [targetOptions, setTargetOptions] = useState([])
    const [careerCenters, setCareerCenters] = useState([])
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false)
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [fetchingCareerCenters, setFetchingCareerCenters] = useState(false)
    const classes = useStyles({
        cardHovered,
        mobile,
        hoverLeft,
        openMoreDetails,
        hasGroups: careerCenters.length,
        registered,
        isExpanded: expanded,
        expanded: expanded && targetOptions.length,
        frontHeight
    })
    const frontRef = useRef()

    const handleMouseLeft = () => {
        cardHovered && setCardHovered(false)
    }

    const handleOpenMoreDetails = () => {
        setOpenMoreDetails(!openMoreDetails)
    }

    useEffect(() => {
        if (frontRef.current?.offsetHeight) {
            setFrontHeight(frontRef.current.offsetHeight * 0.7)
        }
    }, [frontRef.current])


    useEffect(() => {
        if (checkIfHighlighted() && !isHighlighted) {
            setIsHighlighted(true)
        } else if (checkIfHighlighted() && isHighlighted) {
            setIsHighlighted(false)
        }
    }, [livestreamId, id, careerCenterId, groupData.groupId]);

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
            setFetchingCareerCenters(true)
            firebase.getDetailLivestreamCareerCenters(livestream.groupIds)
                .then((querySnapshot) => {
                    let groupList = [];
                    querySnapshot.forEach((doc) => {
                        let group = doc.data();
                        group.id = doc.id;
                        groupList.push(group);
                    });
                    setFetchingCareerCenters(false)
                    setCareerCenters(groupList);
                }).catch(() => setFetchingCareerCenters(false))
        }
    }, []);

    const checkIfHighlighted = () => {
        if (careerCenterId && livestreamId && id && livestreamId === id && groupData.groupId === careerCenterId) {
            return true
        } else return livestreamId && !careerCenterId && !groupData.id && livestreamId === id;
    }

    function targetHasClickHandler(event) {
        let element = event.target;
        if (element.onclick !== null) {
            return true;
        } else {
            return false;
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

    const handleMouseEntered = () => {
        !mobile && !cardHovered && setCardHovered(true)
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
        return Boolean(width === "md" && hasCategories)
    }

    let logoElements = careerCenters.map(careerCenter => {
        return (
            <div className={classes.logoElement} key={careerCenter.groupId}>
                <LogoElement hideFollow={!cardHovered && !mobile} key={careerCenter.groupId}
                             livestreamId={livestream.id}
                             userFollows={checkIfUserFollows(careerCenter)}
                             careerCenter={careerCenter} userData={userData} user={user}/>
            </div>
        );
    })

    let speakerElements = [...livestream.speakers, ...livestream.speakers, ...livestream.speakers].map(speaker => {
        return (<Avatar
            key={speaker.id}
            src={speaker.avatar || speakerPlaceholder}
            alt={speaker.firstName}/>)
    })

    return (
        <Fragment>
            <div
                onMouseEnter={handleMouseEntered}
                className={classes.root}>
                <div
                    onMouseLeave={handleMouseLeft}
                    className={classes.streamCard}>
                    {mobile &&
                    <CopyToClipboard
                        color={cardHovered && "white"}
                        className={classes.copyToClipBoard}
                        value={linkToStream}/>}
                    <Paper ref={frontRef} elevation={4} className={classes.front}>
                        <Grow in={Boolean(userIsRegistered())}>
                            <div className={classes.bookedIcon}>
                                <CheckCircleRoundedIcon color="primary" fontSize="large"/>
                                <Typography color="primary" variant="h6" className={classes.bookedText}>
                                    Booked
                                </Typography>
                            </div>
                        </Grow>
                        <div className={classes.logoTimeWrapper}>
                            <img className={classes.companyLogo} src={livestream.companyLogoUrl} alt=""/>
                        </div>
                        <div className={classes.dateTimeWrapper}>
                            <div className={classes.dateWrapper}>
                                <DateDisplay mobile={mobile} narrow={isNarrow()} date={livestream.start.toDate()}/>
                            </div>
                            <div className={classes.timeWrapper}>
                                <TimeDisplay mobile={mobile} narrow={isNarrow()} date={livestream.start.toDate()}/>
                            </div>
                        </div>
                        <div className={classes.lowerFrontContent}>
                            {!cardHovered &&
                            <img className={classes.lowerFrontBackgroundImage} src={livestream.backgroundImageUrl}
                                 alt="background"/>}
                            {/*<Grow in={Boolean(userIsRegistered() && !cardHovered && !mobile)}>*/}
                            {/*    <div className={classes.bookedIcon}>*/}
                            {/*        <CheckCircleRoundedIcon fontSize="large"/>*/}
                            {/*        <Typography variant="h6" className={classes.bookedText}>*/}
                            {/*            Booked*/}
                            {/*        </Typography>*/}
                            {/*    </div>*/}
                            {/*</Grow>*/}
                            <Typography variant={mobile ? "h6" : "h4"} align="center" className={classes.companyName}>
                                {cardHovered || mobile ? livestream.title : livestream.company}
                            </Typography>
                            {!cardHovered &&
                            <div className={classes.speakersAndLogosWrapper}>
                                {expanded ?
                                    <Streamers speakers={livestream.speakers} cardHovered={cardHovered}/>
                                    :
                                    <AvatarGroup max={3}>
                                        {speakerElements}
                                    </AvatarGroup>}
                                {mobile &&
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
                                    <Button className={classes.expandButton} onClick={() => setExpanded(!expanded)}
                                            fullWidth>
                                        {expanded ? "Show less" : "See more"}
                                    </Button>
                                    <Collapse in={expanded}>

                                        {!!targetOptions.length &&
                                        <div className={classes.expandedOptionsWrapper}>
                                            <TargetOptions className={classes.optionChips} options={targetOptions}/>
                                        </div>}
                                    </Collapse>
                                </div>}
                                <Grow unmountOnExit in={Boolean(logoElements.length)}>
                                    <div className={classes.companyLogosFrontWrapper}>
                                        {logoElements}
                                    </div>
                                </Grow>
                            </div>
                            }
                        </div>
                    </Paper>
                    <div onMouseLeave={handleMouseLeft} className={classes.background}>
                        <img className={classes.backgroundImage} src={livestream.backgroundImageUrl} alt="background"/>
                        <CopyToClipboard
                            color="white"
                            className={classes.copyToClipBoard}
                            value={linkToStream}/>
                        <div className={classes.buttonsWrapper}>
                            <DetailsButton
                                groupData={groupData}
                                listenToUpcoming={listenToUpcoming}
                                livestream={livestream}/>
                            <AttendButton
                                handleRegisterClick={handleRegisterClick}
                                checkIfRegistered={checkIfRegistered}
                                user={user}/>
                        </div>
                        <div className={classes.backgroundContent}>
                            <Streamers speakers={livestream.speakers} cardHovered={cardHovered}/>
                            {!!targetOptions.length &&
                            <div className={classes.optionsWrapper}>
                                <TargetOptions className={classes.optionChips} options={targetOptions}/>
                            </div>}
                        </div>
                        <div className={classes.logosBackWrapper}>
                            {logoElements}
                        </div>
                    </div>
                </div>
            </div>
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
