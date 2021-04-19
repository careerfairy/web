import PropTypes from 'prop-types'
import React, {Fragment, memo, useEffect, useMemo, useState} from 'react';
import {withFirebase} from "context/firebase";
import {fade, makeStyles} from "@material-ui/core/styles";
import UserUtil from "../../../../../data/util/UserUtil";
import DataAccessUtil from "../../../../../util/DataAccessUtil";
import {useRouter} from "next/router";
import GroupJoinToAttendModal from "../GroupJoinToAttendModal";
import BookingModal from "../../../common/booking-modal/BookingModal";
import GroupsUtil from "../../../../../data/util/GroupsUtil";
import {dynamicSort, getResizedUrl} from "../../../../helperFunctions/HelperFunctions";
import {Card, CardHeader, ClickAwayListener, Collapse, Grow} from "@material-ui/core";
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import {Item, Row} from '@mui-treasury/components/flex';
import {Info, InfoSubtitle, InfoTitle} from '@mui-treasury/components/info';
import {useNewsInfoStyles} from '@mui-treasury/styles/info/news';
import {useCoverCardMediaStyles} from '@mui-treasury/styles/cardMedia/cover';
import {AvatarGroup} from "@material-ui/lab";
import {speakerPlaceholder} from "../../../../util/constants";
import Tag from "./Tag";
import Fade from 'react-reveal/Fade';
import clsx from "clsx";
import CopyToClipboard from "../../../common/CopyToClipboard";
import {DateTimeDisplay} from "./TimeDisplay";
import {AttendButton, DetailsButton} from "./actionButtons";
import LogoElement from "../LogoElement";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";

const useStyles = makeStyles(theme => ({
    cardHovered: {
        height: "fit-content",
        transform: 'translateY(-2px)',
        '& $shadow': {
            bottom: '-1.5rem',
        },
        '& $shadow2': {
            bottom: '-2.5rem',
        },
    },
    card: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "-webkit-fill-available",
        justifyContent: "space-between",
        position: 'relative',
        overflow: 'visible',
        borderRadius: '1.5rem',
        transition: '0.4s',
        '&:before': {
            content: '""',
            position: 'absolute',
            zIndex: 0,
            display: 'block',
            width: '100%',
            bottom: -1,
            height: '100%',
            borderRadius: '1.5rem',
            backgroundColor: 'rgba(0,0,0,0.08)',
        },
    },
    main: {
        display: "flex",
        flex: 1,
        minHeight: 340,
        overflow: 'hidden',
        borderTopLeftRadius: '1.5rem',
        borderTopRightRadius: '1.5rem',
        zIndex: 1,
        '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            background: `linear-gradient(to top, ${theme.palette.navyBlue.main}, rgba(0,0,0,0))`,
        },
    },
    mainBooked: {
        '&:after': {
            background: theme.palette.primary.dark,
            opacity: 0.8
        },
    },
    content: {
        bottom: 0,
        width: '100%',
        zIndex: 1,
        padding: theme.spacing(2, 2, 2),
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly"
    },
    avatar: {
        width: 48,
        height: 48,
    },
    groupLogo: {
        width: 75,
        height: 75,
        background: theme.palette.common.white,
        "& img": {
            objectFit: "contain",
            maxWidth: "90%",
            maxHeight: "90%"
        }
    },
    groupLogoStacked: {
        width: 60,
        height: 60,
    },
    tag: {
        display: 'inline-block',
        backgroundColor: '#ff5dac',
        borderRadius: '0.5rem',
        padding: '2px 0.5rem',
        color: '#fff',
        marginBottom: '0.5rem',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 800,
        color: theme.palette.common.white,
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: "2",
        WebkitBoxOrient: "vertical"
    },
    titleHovered:{
        WebkitLineClamp: "inherit",
    },
    author: {
        zIndex: 1,
        position: 'relative',
        borderBottomLeftRadius: '1.5rem',
        borderBottomRightRadius: '1.5rem',
        display: "flex",
        flexDirection: "column",
    },
    authorHovered: {
        boxShadow: theme.shadows[3]
    },
    shadow: {
        transition: '0.2s',
        position: 'absolute',
        zIndex: 0,
        width: '88%',
        height: '100%',
        bottom: 0,
        borderRadius: '1.5rem',
        backgroundColor: 'rgba(0,0,0,0.06)',
        left: '50%',
        transform: 'translateX(-50%)',
    },
    shadow2: {
        bottom: 0,
        width: '72%',
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    previewRow: {
        width: "100%",
        justifyContent: "space-evenly"
    },
    avaLogoWrapper: {
        display: "flex",
        // flexDirection: "column",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center"
    },
    top: {
        zIndex: 995
    },
    groupLogos: {
        justifyContent: "space-evenly",
        display: "flex",
        flexWrap: "wrap",
    },
    livestreamCompanyAva: {
        borderBottomRightRadius: `${theme.spacing(2.5)}px !important`,
        borderTopLeftRadius: `${theme.spacing(2.5)}px !important`,
        width: "100%",
        height: 100,
        boxShadow: theme.shadows[5],
        background: theme.palette.common.white,
        "& img": {
            objectFit: "contain",
            maxWidth: "90%",
            maxHeight: "90%"
        }
    },
    pulseAnimate: {
        animation: `$pulse 1.2s infinite`
    },
    "@keyframes pulse": {
        "0%": {
            MozBoxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 1)}`,
            boxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 1)}`
        },
        "70%": {
            MozBoxShadow: `0 0 0 15px ${fade(theme.palette.primary.main, 0)}`,
            boxShadow: `0 0 0 15px ${fade(theme.palette.primary.main, 0)}`
        },
        "100%": {
            MozBoxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 0)}`,
            boxShadow: `0 0 0 0 ${fade(theme.palette.primary.main, 0)}`
        }
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
        color: theme.palette.common.white,

    },
}))


const maxOptions = 2
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
                                    isTargetDraft,
                                    setGlobalCardHighlighted,
                                    isPastLivestreams,
                                    globalCardHighlighted,
                                    isAdmin,
                                }) => {
    const mediaStyles = useCoverCardMediaStyles();
    const classes = useStyles()
    const {pathname, absolutePath} = useRouter();
    const linkToStream = useMemo(() => pathname === "/next-livestreams/[groupId]" ?
        `/next-livestreams/${groupData.groupId}?livestreamId=${livestream.id}` :
        `/next-livestreams?livestreamId=${livestream.id}`,
        [pathname, livestream?.id, groupData?.groupId]
    )

    function userIsRegistered() {
        if (user.isLoaded && user.isEmpty || !livestream.registeredUsers || isAdmin) {
            return false;
        }
        return Boolean(livestream.registeredUsers?.indexOf(user.email) > -1)
    }


    const registered = useMemo(() => userIsRegistered(), [livestream.registeredUsers])

    const [cardHovered, setCardHovered] = useState(false)
    const [targetOptions, setTargetOptions] = useState([])
    const [careerCenters, setCareerCenters] = useState([])
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false)
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [groupsWithPolicies, setGroupsWithPolicies] = useState([]);

    useEffect(() => {
        if (checkIfHighlighted() && !isHighlighted) {
            setIsHighlighted(true)
            // setGlobalCardHighlighted?.(true)
            // setCardHovered(true)
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
                const filteredOptions = flattenedOptions.filter(option => matchedOptions.includes(option.id)).sort(dynamicSort("name")).reverse()
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
                }).catch((e) => {
                console.log("error", e)
            })
        }
    }, []);


    const handleMouseEntered = () => {
        if (
            !cardHovered && !globalCardHighlighted) {
            setCardHovered(true)
        }
    }

    const handleMouseLeft = () => {
        if (isHighlighted) {
            // setGlobalCardHighlighted?.(false)
        }
        cardHovered && setCardHovered(false)
    }

    const checkIfHighlighted = () => {
        if (isTargetDraft) return true
        if ((careerCenterId) && livestreamId && id && livestreamId === id && groupData.groupId === careerCenterId) {
            return true
        } else return livestreamId && !careerCenterId && livestreamId === id;
    }

    const checkIfUserFollows = (careerCenter) => {
        if (user.isLoaded && !user.isEmpty && userData && userData.groupIds) {
            const {groupId} = careerCenter
            return userData.groupIds.includes(groupId)
        } else {
            return false
        }
    }

    function deregisterFromLivestream() {
        if (user.isLoaded && user.isEmpty) {
            return router.push({
                pathname: '/login',
                query: {absolutePath}
            });
        }

        firebase.deregisterFromLivestream(livestream.id, user.email);
    }

    async function startRegistrationProcess() {
        if (user.isLoaded && user.isEmpty || !user.emailVerified) {
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
        const {
            hasAgreedToAll,
            groupsWithPolicies
        } = await GroupsUtil.getPolicyStatus(careerCenters, user.email, firebase)
        if (!hasAgreedToAll) {
            setOpenJoinModal(true)
            setGroupsWithPolicies(groupsWithPolicies)
        } else if (listenToUpcoming) {// If on next livestreams tab...
            if (!userFollowingAnyGroup() && livestream.groupIds?.length) {
                setOpenJoinModal(true)
            } else {
                firebase.registerToLivestream(livestream.id, user.email, groupsWithPolicies).then(() => {
                    setCardHovered(false)
                    setBookingModalOpen(true);
                    sendEmailRegistrationConfirmation();
                })
            }
        } else { // if on any other tab that isn't next livestreams...
            if (!userFollowingCurrentGroup()) {
                setOpenJoinModal(true)
            } else {
                firebase.registerToLivestream(livestream.id, user.email, groupsWithPolicies).then(() => {
                    setCardHovered(false)
                    setBookingModalOpen(true);
                    sendEmailRegistrationConfirmation();
                })
            }
        }

    }

    function completeRegistrationProcess() {
        firebase.registerToLivestream(livestream.id, user.email, groupsWithPolicies).then(() => {
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
        if (isAdmin) {
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

    const handleCardClick = () => {
        if (mobile) {
            setCardHovered(true)
        }
    }

    const handleClickAwayDetails = () => {
        if (mobile) {
            setCardHovered(false)
        }
    }

    return (
        <Fragment>
            <ClickAwayListener onClickAway={handleClickAwayDetails}>
                <Card
                    onClick={handleCardClick}
                    onMouseEnter={handleMouseEntered}
                    onMouseLeave={handleMouseLeft}
                    className={clsx(classes.card, {
                        [classes.top]: cardHovered,
                        [classes.cardHovered]: cardHovered,
                        [classes.pulseAnimate]: isHighlighted
                    })}
                >
                    <Box className={clsx(classes.main, {
                        [classes.mainBooked]: registered
                    })}
                         position={'relative'}>

                        <CardMedia
                            classes={mediaStyles}
                            image={getResizedUrl(livestream.backgroundImageUrl)}
                        />
                        <div className={classes.content}>
                            <CardHeader
                                avatar={
                                    <DateTimeDisplay mobile={mobile}
                                                     date={livestream.start.toDate()}/>
                                }
                                title={
                                    <Avatar
                                        variant="rounded"
                                        className={classes.livestreamCompanyAva}
                                        src={getResizedUrl(livestream.companyLogoUrl)}
                                        alt={livestream.company}
                                    />
                                }
                                action={
                                    <CopyToClipboard
                                        color="white"
                                        value={linkToStream}/>
                                }
                            />
                            <Collapse collapsedHeight={80} in={cardHovered}>
                            <Typography
                                variant={'h2'}
                                className={clsx(classes.title, {
                                    [classes.titleHovered]: cardHovered
                                })}
                            >
                                {livestream.title}
                            </Typography>
                            </Collapse>
                            <Box style={{maxHeight: 165, overflow: "auto", overflowX: "hidden"}}>
                                {targetOptions.slice(0, cardHovered ? -1 : maxOptions).map(option =>
                                    <Tag key={option.id} option={option}/>
                                )}
                                {(targetOptions.length > maxOptions && !cardHovered) &&
                                <Tag option={{id: "hasMore", name: "..."}}/>}
                            </Box>
                            {!isPastLivestreams ? (<Box marginTop={1}>
                                <DetailsButton
                                    size="small"
                                    mobile={mobile}
                                    groupData={groupData}
                                    listenToUpcoming={listenToUpcoming}
                                    livestream={livestream}/>
                                <AttendButton
                                    size="small"
                                    mobile={mobile}
                                    handleRegisterClick={handleRegisterClick}
                                    checkIfRegistered={checkIfRegistered}
                                    user={user}/>
                                <Grow in={Boolean(userIsRegistered())}>
                                    <div className={classes.bookedIcon}>
                                        <CheckCircleRoundedIcon/>
                                        <Typography variant="h6" className={classes.bookedText}>
                                            Booked
                                        </Typography>
                                    </div>
                                </Grow>
                            </Box>) : null}
                        </div>
                    </Box>
                    <Row
                        className={clsx(classes.author,{
                            [classes.authorHovered]: cardHovered
                        })}
                        m={0}
                        p={1}
                        py={1}
                        gap={mobile ? 1 : 2}
                        bgcolor={'common.white'}
                    >
                        <Collapse unmountOnExit in={!cardHovered}>
                            <Fade timeout={300} unmountOnExit in={!cardHovered}>
                                <Row style={{justifyContent: "space-evenly"}} className={classes.avaLogoWrapper}>
                                    <Item>
                                        <AvatarGroup>
                                            {livestream.speakers?.map(speaker => (
                                                <Avatar
                                                    key={speaker.id}
                                                    className={classes.avatar}
                                                    src={getResizedUrl(speaker.avatar) || speakerPlaceholder}
                                                    alt={speaker.firstName}
                                                />
                                            ))}
                                        </AvatarGroup>
                                    </Item>
                                    <Item>
                                        <AvatarGroup>
                                            {careerCenters.map(careerCenter => (
                                                <Avatar
                                                    variant="rounded"
                                                    key={careerCenter.id}
                                                    className={clsx(classes.groupLogo, classes.groupLogoStacked)}
                                                    src={getResizedUrl(careerCenter.logoUrl)}
                                                    alt={careerCenter.universityName}
                                                />
                                            ))}
                                        </AvatarGroup>
                                    </Item>
                                </Row>
                            </Fade>
                        </Collapse>
                        <Collapse unmountOnExit in={cardHovered}>
                            <div className={classes.avaLogoWrapper}>
                                {livestream.speakers?.map(speaker => (
                                    <Row className={classes.previewRow} key={speaker.id}>
                                        <Item>
                                            <Avatar

                                                className={classes.avatar}
                                                src={getResizedUrl(speaker.avatar) || speakerPlaceholder}
                                                alt={speaker.firstName}
                                            />
                                        </Item>
                                        <Info style={{marginRight: "auto"}} useStyles={useNewsInfoStyles}>
                                            <InfoTitle>{`${speaker.firstName} ${speaker.lastName}`}</InfoTitle>
                                            <InfoSubtitle>{speaker.position}</InfoSubtitle>
                                        </Info>
                                    </Row>
                                ))}
                                <Row p={1} style={{width: "100%"}} className={classes.groupLogos}>
                                    {careerCenters.map(careerCenter => (
                                        <LogoElement
                                            className={classes.groupLogo}
                                            hideFollow={(!cardHovered && !mobile) || isAdmin} key={careerCenter.groupId}
                                            livestreamId={livestream.id}
                                            userFollows={checkIfUserFollows(careerCenter)}
                                            careerCenter={careerCenter} userData={userData} user={user}
                                        />
                                    ))}
                                </Row>
                            </div>
                        </Collapse>
                    </Row>
                    <div className={classes.shadow}/>
                    <div className={`${classes.shadow} ${classes.shadow2}`}/>
                </Card>
            </ClickAwayListener>
            <GroupJoinToAttendModal
                open={openJoinModal}
                groups={getGroups()}
                groupsWithPolicies={groupsWithPolicies}
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

GroupStreamCardV2.propTypes = {
    careerCenterId: PropTypes.string,
    firebase: PropTypes.object,
    globalCardHighlighted: PropTypes.bool,
    groupData: PropTypes.object,
    id: PropTypes.string,
    isAdmin: PropTypes.bool,
    isTargetDraft: PropTypes.bool,
    listenToUpcoming: PropTypes.bool,
    livestream: PropTypes.object.isRequired,
    livestreamId: PropTypes.string,
    mobile: PropTypes.bool,
    setGlobalCardHighlighted: PropTypes.func,
    user: PropTypes.object,
    userData: PropTypes.object,
    isPastLivestreams: PropTypes.bool,
}

export default withFirebase(GroupStreamCardV2);

