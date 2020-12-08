import React, {Fragment, memo, useEffect, useState} from 'react';
import {withFirebase} from "context/firebase";
import {fade, makeStyles} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../../../util/constants";
import {Avatar, Collapse, Fade, Paper} from "@material-ui/core";
import {AvatarGroup} from "@material-ui/lab";
import Streamers from "./Streamers";
import Wave from "./Wave";
import Typography from "@material-ui/core/Typography";
import LogoElement from "../LogoElement";
import QueryBuilderRoundedIcon from "@material-ui/icons/QueryBuilderRounded";
import DateUtil from "../../../../../util/DateUtil";
import TargetOptions from "../../GroupsCarousel/TargetOptions";
import {grey} from "@material-ui/core/colors";
import EventNoteRoundedIcon from "@material-ui/icons/EventNoteRounded";
import UserUtil from "../../../../../data/util/UserUtil";
import DataAccessUtil from "../../../../../util/DataAccessUtil";
import {useRouter} from "next/router";
import GroupJoinToAttendModal from "../GroupJoinToAttendModal";
import BookingModal from "../../../common/booking-modal/BookingModal";
import CopyToClipboard from "../CopyToClipboard";
import {AttendButton, DetailsButton} from "./actionButtons";
import MobileComponent from "./MobileComponent";

const useStyles = makeStyles((theme) => {
    const transition = `transform ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`
    const paperColor = theme.palette.background.paper
    const frontHoveredHeight = 330
    const frontHoveredScale = 0.7
    const frontHoveredTranslate = -115
    return ({
        streamCardRoot: {
            display: "flex",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            position: "relative",
            webKitPosition: "relative",
            transform: ({even, cardHovered}) => cardHovered ? even ? `translate(-25%)` : `translate(25%)` : "none",
            transitionProperty: "transform",
            transitionDuration: `${theme.transitions.duration.shorter}ms`,
            transitionTimingFunction: theme.transitions.easing.easeInOut,
            // zIndex: ({openMoreDetails}) => openMoreDetails && 1002
            zIndex: ({cardHovered, openMoreDetails}) => (cardHovered || openMoreDetails) && 1002,
            "& p": {
                color: ({cardHovered}) => cardHovered ? theme.palette.common.white : theme.palette.common.black
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
            WebkitTransition: transition,
            transition: transition,
            transform: ({cardHovered}) => cardHovered && "translate(57%, 0%)",
            flexDirection: ({cardHovered}) => cardHovered && "column",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        frontLabelRight: {
            color: ({cardHovered}) => cardHovered && theme.palette.common.white,
            position: 'absolute',
            top: '0',
            right: '1em',
            zIndex: '999',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            padding: '0.5em 0.5em 0.75em',
            WebkitTransition: transition,
            transition: transition,
            transform: ({cardHovered}) => cardHovered && "translate(71%, -40%)",
            flexDirection: ({cardHovered}) => cardHovered && "column",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        frontLabelLeft: {
            flexDirection: ({cardHovered}) => cardHovered && "column",
            color: ({cardHovered}) => cardHovered && theme.palette.common.white,
            position: 'absolute',
            top: '0',
            left: '1em',
            zIndex: '999',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            padding: '0.5em 0.5em 0.75em',
            WebkitTransition: transition,
            transition: transition,
            transform: ({cardHovered}) => cardHovered && "translate(-68%, -40%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        companyLogo: {
            maxWidth: "100%",
            maxHeight: "65%"
        },
        logoWrapper: {
            height: 230,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing(5),
            borderRadius: `${theme.spacing(2)}px 0px`,
            background: paperColor,
            boxShadow: ({cardHovered}) => cardHovered && theme.shadows[24]
        },
        companyName: {
            fontWeight: "bold",
            fontSize: theme.spacing(3.5),
            margin: '0.5em 0',
            textAlign: 'center',
            display: "flex",
            alignItems: "center",
            width: ({cardHovered}) => cardHovered && "135%",
            height: ({cardHovered}) => cardHovered ? "auto" : 60,
            padding: `0 ${theme.spacing(1)}px`,
            color: "white !important",
            zIndex: 1,
        },
        front: {
            position: "relative",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: ({cardHovered}) => cardHovered && `translateY(${frontHoveredTranslate}px) scale(${frontHoveredScale})`,
            transition: '250ms',
            background: ({cardHovered}) => cardHovered ? "transparent" : theme.palette.navyBlue.main,
            boxShadow: ({cardHovered}) => cardHovered && "none",
            borderRadius: theme.spacing(2.5),
            height: ({cardHovered}) => cardHovered ? frontHoveredHeight : "100%",
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
        speakerAndButtonsWrapper: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        },
        logosFrontWrapper: {
            background: "white",
            padding: theme.spacing(1),
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            height: 100,
            borderRadius: "inherit",
            zIndex: 1,
        },
        buttonsWrapper: {
            marginTop: (frontHoveredHeight * frontHoveredScale) - (-frontHoveredTranslate / 2.3),
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
        background: {
            transition: ({cardHovered}) => cardHovered && `${transition}, opacity 100ms linear`,
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
            margin: "0 auto",
            padding: `${theme.spacing(1)}px ${theme.spacing(0.5)}px`,
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
            borderRadius: "inherit"
        },
        lowerFrontBackgroundImage: {
            borderBottomRightRadius: "inherit",
            borderBottomLeftRadius: "inherit",
            position: "absolute",
            opacity: '.3',
            height: '100%',
            width: '100%',
            objectFit: 'cover',
        },
    })
})


const GroupStreamCardV2 = memo(({
                                    livestream,
                                    user,
                                    mobile,
                                    fields,
                                    userData,
                                    firebase,
                                    livestreamId,
                                    id,
                                    careerCenterId,
                                    groupData,
                                    listenToUpcoming,
                                    hasCategories,
                                    index
                                }) => {

    const router = useRouter();
    const absolutePath = router.asPath
    const even = (index + 1) % 2 === 0
    const linkToStream = listenToUpcoming ? `/next-livestreams?livestreamId=${livestream.id}` : `/next-livestreams?careerCenterId=${groupData.groupId}&livestreamId=${livestream.id}`

    const [cardHovered, setCardHovered] = useState(false)
    const [openMoreDetails, setOpenMoreDetails] = useState(false)
    const classes = useStyles({cardHovered, mobile, even, openMoreDetails})
    const [careerCenters, setCareerCenters] = useState([])
    const [targetOptions, setTargetOptions] = useState([])
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false)
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [fetchingCareerCenters, setFetchingCareerCenters] = useState(false)

    const handleMouseLeft = () => {
        cardHovered && setCardHovered(false)
    }

    const handleOpenMoreDetails = () => {
        setOpenMoreDetails(!openMoreDetails)
    }


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

    function userIsRegistered() {
        if (!user || !livestream.registeredUsers) {
            return false;
        }
        return checkIfRegistered();
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

    let speakerElements = livestream.speakers?.map(speaker => {
        return (<Avatar
            key={speaker.id}
            src={speaker.avatar || speakerPlaceholder}
            alt={speaker.firstName}/>)
    })

    return (
        <Fragment>
            <div
                onMouseLeave={handleMouseLeft} onMouseEnter={handleMouseEntered}
                className={classes.streamCardRoot}>
                <div className={classes.frontLabelLeft}>
                    <QueryBuilderRoundedIcon
                        style={{marginRight: "0.7rem"}}/>{DateUtil.getPrettyTime(livestream.start.toDate())}
                </div>
                <CopyToClipboard color={cardHovered && "white"} className={classes.copyToClipBoard}
                                 value={linkToStream}/>
                <div className={classes.frontLabelRight}>
                    <EventNoteRoundedIcon
                        style={{marginRight: "0.7rem"}}/>{DateUtil.getPrettyDay(livestream.start.toDate())}
                </div>
                <Paper elevation={4} className={classes.front}>
                    <div className={classes.logoWrapper}>
                        <img className={classes.companyLogo} src={livestream.companyLogoUrl} alt=""/>
                    </div>
                    <div className={classes.lowerFrontContent}>
                        {!cardHovered &&
                        <img className={classes.lowerFrontBackgroundImage} src={livestream.backgroundImageUrl}
                             alt="background"/>}
                        <Typography className={classes.companyName}>
                            {cardHovered ? livestream.title : livestream.company}
                        </Typography>
                        {mobile &&
                        <MobileComponent
                            handleOpenMoreDetails={handleOpenMoreDetails}
                            openMoreDetails={openMoreDetails}
                            speakerElements={speakerElements}
                            logoElements={logoElements}
                            targetOptions={targetOptions}
                            listenToUpcoming={listenToUpcoming}
                            livestream={livestream}
                            groupData={groupData}
                            handleRegisterClick={handleRegisterClick}
                            checkIfRegistered={checkIfRegistered}
                            user={user}/>}
                        {!cardHovered && !openMoreDetails &&
                        <Fade timeout={250} in={!openMoreDetails}>
                            <div className={classes.speakersAndLogosWrapper}>
                                {!mobile && <AvatarGroup max={3}>
                                    {speakerElements}
                                </AvatarGroup>}
                                <div className={classes.logosFrontWrapper}>
                                    {logoElements}
                                </div>
                            </div>
                        </Fade>
                        }
                    </div>
                </Paper>
                <div className={classes.background}>
                    <img className={classes.backgroundImage} src={livestream.backgroundImageUrl} alt="background"/>
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
                            <TargetOptions options={targetOptions}/>
                        </div>}
                    </div>
                    <div className={classes.logosBackWrapper}>
                        {logoElements}
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
