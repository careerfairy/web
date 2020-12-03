import React, {Fragment, useEffect, useRef, useState} from 'react';
import {withFirebase} from "context/firebase";
import {fade, makeStyles} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../../../util/constants";
import {Avatar, Button, Card, CardMedia, Paper} from "@material-ui/core";
import {AvatarGroup} from "@material-ui/lab";
import Streamers from "./Streamers";
import Link from "next/link";
import Wave from "./Wave";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import Typography from "@material-ui/core/Typography";
import LogoElement from "../LogoElement";
import QueryBuilderRoundedIcon from "@material-ui/icons/QueryBuilderRounded";
import DateUtil from "../../../../../util/DateUtil";
import TargetOptions from "../../GroupsCarousel/TargetOptions";
import {grey} from "@material-ui/core/colors";
import EventNoteRoundedIcon from "@material-ui/icons/EventNoteRounded";
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import AddToPhotosRoundedIcon from "@material-ui/icons/AddToPhotosRounded";
import UserUtil from "../../../../../data/util/UserUtil";
import DataAccessUtil from "../../../../../util/DataAccessUtil";

const useStyles = makeStyles((theme) => {
    const transition = `transform ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`
    const paperColor = theme.palette.background.paper
    return ({
        game: {
            display: "flex",
            width: "100%",
            justifyContent: "center",
            position: "relative",
            zIndex: ({cardHovered}) => cardHovered && 1002,
            "& p": {
                color: ({cardHovered}) => cardHovered ? theme.palette.common.white : theme.palette.common.black
            },
        },
        time: {
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
        date: {
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
            maxWidth: "100%"
        },
        logoWrapper: {
            height: 230,
            width: "100%",
            display: "flex",
            alignItems: "center",
            padding: theme.spacing(2),
            borderRadius: `${theme.spacing(2)}px 0px`,
            background: grey[50],
            boxShadow: ({cardHovered}) => cardHovered && theme.shadows[24]
        },
        companyName: {
            fontWeight: "bold",
            margin: '0.75em 0',
            textAlign: 'center',
            fontSize: theme.spacing(3),
            display: "flex",
            alignItems: "center",
            width: ({cardHovered}) => cardHovered && "120%"
        },
        front: {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: ({cardHovered}) => cardHovered && "translateY(-115px) scale(0.7)",
            transition: '250ms',
            background: ({cardHovered}) => cardHovered ? "transparent" : fade(paperColor, 0.5),
            boxShadow: ({cardHovered}) => cardHovered && "none",
            borderRadius: theme.spacing(2.2)
        },
        speakersAndLogosWrapper: {
            opacity: ({cardHovered}) => cardHovered && 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        },
        speakerAndButtonsWrapper: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        },
        logosFrontWrapper: {
            padding: theme.spacing(1),
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            height: 100
        },
        detailsBtn: {
            borderRadius: theme.spacing(2),
        },
        buttonsWrapper: {
            display: "flex",
            justifyContent: "center",
            marginBottom: theme.spacing(1)
        },
        background: {
            transition: ({cardHovered}) => cardHovered && `${transition}, opacity 100ms linear`,
            transform: ({cardHovered}) => cardHovered ? 'scale(1.35, 1.3) translateY(5%)' : 'scale(0.2, 0.9)',
            opacity: ({cardHovered}) => cardHovered ? 1 : 0,
            background: 'rgb(40, 46, 54)',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: "auto",
            zIndex: '-1',
            borderRadius: theme.spacing(2),
            overflow: 'hidden',
            boxShadow: theme.shadows[24]
        },
        backgroundContent: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: theme.spacing(2),
            marginTop:({streamTitleHeight}) => 100 + streamTitleHeight,
            zIndex: 1005
        },
        backgroundImage: {
            position: "absolute",
            opacity: '.3',
            clipPath: 'url(#wave)',
            height: '30%',
            width: '100%',
            objectFit: 'cover',
        },
        '@keyframes gameName': {
            '0%': {
                textAlign: 'left',
                opacity: '1'
            },
            '20%': {
                textAlign: 'left',
                opacity: '0'
            },
            '50%': {
                textAlign: 'center',
                opacity: '0',
                transform: 'scale(1.2)'
            },
            '100%': {
                textAlign: 'center',
                opacity: '1',
                transform: 'scale(1.2)'
            }
        }
    })
})


const GroupStreamCardV2 = ({
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
                               hasCategories
                           }) => {

    const [cardHovered, setCardHovered] = useState(false)
    const [streamTitleHeight, setStreamTitleHeight] = useState(0)
    console.log("streamTitleHeight", streamTitleHeight);
    const classes = useStyles({cardHovered, mobile, hasCategories, listenToUpcoming, streamTitleHeight})
    const [careerCenters, setCareerCenters] = useState([])
    const [targetOptions, setTargetOptions] = useState([])
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false)
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [fetchingCareerCenters, setFetchingCareerCenters] = useState(false)

    const streamTitleRef = useRef();

    useEffect(() => {
        setStreamTitleHeight(streamTitleRef.current?.offsetHeight);
    }, []);

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
    }, [livestream.id]);

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
        !mobile && setCardHovered(true)
    }

    const handleMouseLeft = () => {
        !mobile && setCardHovered(false)
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
            if (!userFollowingAnyGroup()) {
                setOpenJoinModal(true)
            } else {
                firebase.registerToLivestream(livestream.id, user.email).then(() => {
                    setBookingModalOpen(true);
                    sendEmailRegistrationConfirmation();
                })
            }
        } else { // if on any other tab that isn't next livestreams...
            if (!userFollowingCurrentGroup()) {
                setOpenJoinModal(true)
            } else {
                firebase.registerToLivestream(livestream.id, user.email).then(() => {
                    setBookingModalOpen(true);
                    sendEmailRegistrationConfirmation();
                })
            }
        }

    }

    function completeRegistrationProcess() {
        firebase.registerToLivestream(livestream.id, user.email).then(() => {
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

    let logoElements = careerCenters.map((careerCenter, index) => {
        return (
            <div style={{flex: 1, minWidth: "25%"}} key={careerCenter.groupId}>
                <LogoElement key={careerCenter.groupId} livestreamId={livestream.id}
                             userfollows={checkIfUserFollows(careerCenter)}
                             careerCenter={careerCenter} userData={userData} user={user}/>
            </div>
        );
    });

    let speakerElements = livestream.speakers?.map(speaker => {
        return (<Avatar
            key={speaker.id}
            src={speaker.avatar || speakerPlaceholder}
            alt={speaker.firstName}/>)
    })

    return (
        <Fragment>
            <div onMouseLeave={handleMouseLeft} onMouseEnter={handleMouseEntered} className={classes.game}>
                <div className={classes.time}>
                    <QueryBuilderRoundedIcon
                        style={{marginRight: "0.7rem"}}/>{DateUtil.getPrettyTime(livestream.start.toDate())}
                </div>
                <div className={classes.date}>
                    <EventNoteRoundedIcon
                        style={{marginRight: "0.7rem"}}/>{DateUtil.getPrettyDay(livestream.start.toDate())}
                </div>
                <Paper elevation={4} className={classes.front}>
                    <div
                        // elevation={cardHovered ? 24 : 4}
                        className={classes.logoWrapper}>
                        <img className={classes.companyLogo} src={livestream.companyLogoUrl} alt=""/>
                    </div>
                    <Typography ref={streamTitleRef} className={classes.companyName}>
                        {cardHovered ? livestream.title : livestream.company}
                    </Typography>
                    {!cardHovered &&
                    <div className={classes.speakersAndLogosWrapper}>
                        <AvatarGroup max={3}>
                            {speakerElements}
                        </AvatarGroup>
                        <div className={classes.logosFrontWrapper}>
                            {logoElements}
                        </div>
                    </div>}
                </Paper>
                <div className={classes.background}>
                    <img className={classes.backgroundImage} src={livestream.backgroundImageUrl} alt="background"/>
                    <div className={classes.backgroundContent}>
                        <div className={classes.buttonsWrapper}>
                            <Link
                                prefetch={false}
                                href={{
                                    pathname: `/upcoming-livestream/${livestream.id}`,
                                    query: listenToUpcoming ? null : {groupId: groupData.groupId}
                                }}><a>
                                <Button className={classes.detailsBtn}
                                        style={{marginRight: 5}}
                                        startIcon={<LibraryBooksIcon/>}
                                        size="large"
                                        children="Details"
                                        variant="contained" color="secondary"/>
                            </a></Link>
                            <Button className={classes.detailsBtn} size='large' style={{marginLeft: 5}}
                                    variant="contained"
                                    startIcon={(user && checkIfRegistered()) ?
                                        <ClearRoundedIcon/> : <AddToPhotosRoundedIcon/>}
                                    color={(user && checkIfRegistered()) ? "default" : 'primary'}
                                    children={user ? (checkIfRegistered() ? 'Cancel' : 'I\'ll attend') : 'Register to attend'}
                                    onClick={handleRegisterClick}/>

                        </div>
                        <Streamers speakers={livestream.speakers} cardHovered={cardHovered}/>
                        <div style={{padding: "1rem", paddingTop: 0}}>
                            {!!targetOptions.length &&
                            <TargetOptions options={targetOptions}/>}
                        </div>
                    </div>
                </div>
            </div>
            <Wave/>
        </Fragment>
    )

}


export default withFirebase(GroupStreamCardV2);
