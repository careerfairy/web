import React, {useEffect, useState} from 'react';
import VolumeUpRoundedIcon from '@material-ui/icons/VolumeUpRounded';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import {useRouter} from 'next/router';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import {withFirebasePage} from '../../../context/firebase';
import * as actions from '../../../store/actions'
import ViewerComponent from 'components/views/viewer/viewer-component/ViewerComponent';
import IconsContainer from 'components/views/streaming/icons-container/IconsContainer';
import {useWindowSize} from 'components/custom-hook/useWindowSize';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LeftMenu from "../../../components/views/viewer/LeftMenu/LeftMenu";
import MiniChatContainer from "../../../components/views/streaming/LeftMenu/categories/chat/MiniChatContainer";
import EmoteButtons from "../../../components/views/viewer/EmoteButtons";
import RatingContainer from "../../../components/views/viewer/rating-container/RatingContainer";
import {useAuth} from 'HOCs/AuthProvider';
import {useDispatch} from "react-redux";
import {useThemeToggle} from "../../../context/theme/ThemeContext";
import {Avatar, useTheme} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from '@material-ui/core/AppBar';
import {MainLogo} from "../../../components/logos";
import Box from "@material-ui/core/Box";
import Backdrop from '@material-ui/core/Backdrop';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import clsx from "clsx";
import Checkbox from '@material-ui/core/Checkbox';
import {logoPlaceholder} from "../../../components/util/constants";

const useStyles = makeStyles((theme) => ({
    image: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '28px'
    },
    root: {
        position: "relative",
        minHeight: "100vh",
        height: "100%",
        width: "100%",
        touchAction: "manipulation",
    },
    toolbar: {
        minHeight: 55,
        display: "flex",
        justifyContent: "space-between"
    },
    menuLeft: {
        position: "absolute",
        transition: "width 0.3s",
        boxShadow: theme.shadows[5],
        transitionTimingFunction: theme.transitions.easeInOut,
        width: ({showMenu, mobile}) => showMenu ? (mobile ? "100%" : 280) : 0,
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 20,
        [theme.breakpoints.up("mobile")]: {
            top: 55,
        },
    },

    blackFrame: {
        zIndex: 10,
        backgroundColor: "black",
        position: "absolute",
        left: "0",
        right: "0",
        bottom: "0",
        top: 0,
        [theme.breakpoints.down("mobile")]: {
            width: "100%",
        },
        [theme.breakpoints.up("mobile")]: {
            top: "55px",
        }
    },
    withMenu: {
        [theme.breakpoints.up("mobile")]: {
            position: "absolute",
            top: "55px",
            bottom: "0",
            right: "0",
            left: "280px"
        }
    },
    miniChatContainer: {
        position: "absolute",
        bottom: "0",
        right: "40px",
        width: "20%",
        minWidth: "250px",
        zIndex: 7250
    },
    iconsContainer: {
        position: "absolute",
        bottom: "50px",
        right: "60px",
        zIndex: 100,
        width: "80px"
    },
    backdropContent: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    backdrop: {
        cursor: "pointer",
        zIndex: 200
    },
    joinButton:{
        marginLeft: theme.spacing(1)
    }
}));

const useLogoStyles = makeStyles(theme => ({
    logo: {
        padding: theme.spacing(0.5),
        margin: theme.spacing(0, 1),
        background: theme.palette.common.white,
        width: 70,
        boxShadow: theme.shadows[1],
        "& img": {
            objectFit: "contain"
        }
    },
}))
const Logo = ({src}) => {
    const classes = useLogoStyles()
    return (
        <Avatar
            className={classes.logo}
            src={src}
            variant="rounded"
        />
    )
}

function ViewerPage({firebase}) {
    const {toggleTheme, themeMode} = useThemeToggle()
    const DELAY = 3000; //3 seconds
    const router = useRouter();
    const livestreamId = router.query.livestreamId;
    const dispatch = useDispatch()
    const [showMenu, setShowMenu] = useState(false);

    const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);
    const [currentLivestream, setCurrentLivestream] = useState(false);

    const [careerCenters, setCareerCenters] = useState([]);
    const [handRaiseActive, setHandRaiseActive] = useState(false);
    const [iconsDisabled, setIconsDisabled] = useState(false);
    const [showVideoButton, setShowVideoButton] = useState({paused: false, muted: false});
    const [unmute, setUnmute] = useState(false);
    const [play, setPlay] = useState(false);
    const {width, height} = useWindowSize();


    const classes = useStyles({showMenu, mobile: width < 768});
    const [open, setOpen] = React.useState(true);
    const [delayHandler, setDelayHandler] = useState(null)

    const {authenticatedUser, userData} = useAuth();

    if (currentLivestream && !currentLivestream.test && authenticatedUser?.isLoaded && authenticatedUser?.isEmpty) {
        router.replace({
            pathname: `/login`,
            query: {absolutePath: router.asPath},
        });
    }

    useEffect(() => {
        if (width < 768) {
            setShowMenu(false)
        } else {
            setShowMenu(true);
        }
    }, [width]);

    useEffect(() => {
        if (userData && userData.userEmail && livestreamId) {
            firebase.setUserIsParticipating(livestreamId, userData);
        }
    }, [livestreamId, userData]);

    useEffect(() => {
        if (livestreamId) {
            firebase.listenToScheduledLivestreamById(livestreamId, querySnapshot => {
                let livestream = querySnapshot.data();
                livestream.id = querySnapshot.id;
                setCurrentLivestream(livestream);
            });
        }
    }, [livestreamId]);

    useEffect(() => {
        if (currentLivestream?.groupIds?.length) {
            firebase.getDetailLivestreamCareerCenters(currentLivestream.groupIds)
                .then((querySnapshot) => {
                    let groupList = [];
                    querySnapshot.forEach((doc) => {
                        let group = doc.data();
                        group.id = doc.id;
                        groupList.push(group);
                    });
                    setCareerCenters(groupList);
                });
        }
    }, [currentLivestream]);

    useEffect(() => {
        if (userData?.talentPools && currentLivestream && userData.talentPools.indexOf(currentLivestream.companyId) > -1) {
            setUserIsInTalentPool(true);
        } else {
            setUserIsInTalentPool(false);
        }
    }, [currentLivestream, userData]);


    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleMouseEnter = event => {
        clearTimeout(delayHandler)
        handleOpen()
    }

    const handleMouseLeave = () => {
        setDelayHandler(setTimeout(() => {
            handleClose()
        }, DELAY))
    }

    const handleClap = () => {
        postIcon('clapping')
    }

    const handleLike = () => {
        postIcon('like')
    }
    const handleHeart = () => {
        postIcon('heart')
    }
    const toggleShowMenu = () => {
        setShowMenu(!showMenu)
    }

    function joinTalentPool() {
        if (!authenticatedUser) {
            return router.replace('/signup');
        }

        firebase.joinCompanyTalentPool(currentLivestream.companyId, authenticatedUser.email, currentLivestream.id);
    }

    function leaveTalentPool() {
        if (!authenticatedUser) {
            return router.replace('/signup');
        }

        firebase.leaveCompanyTalentPool(currentLivestream.companyId, authenticatedUser.email, currentLivestream.id);
    }

    function postIcon(iconName) {
        if (!iconsDisabled) {
            dispatch(actions.createEmote(iconName))
            setIconsDisabled(true);
        }
    }

    function unmuteVideos() {
        setShowVideoButton(prevState => {
            return {paused: prevState.paused, muted: false}
        });
        setUnmute(true);
    }

    function playVideos() {
        setShowVideoButton(prevState => {
            return {paused: false, muted: false}
        });
        setPlay(true);
    }

    let logoElements = careerCenters.map((careerCenter, index) => {
        return (
            <Logo
                key={careerCenter.groupId}
            src={careerCenter.logoUrl}
            />
        );
    });

    return (
        <div className={classes.root}>
            {width >= 768 &&
            <AppBar elevation={1} color="transparent">
                <Toolbar className={classes.toolbar}>
                    <MainLogo/>
                    {logoElements}
                    <Box flexGrow={1}/>
                    <Logo
                        src={currentLivestream.companyLogoUrl || logoPlaceholder}
                    />
                    <Checkbox
                        checked={themeMode === "dark"}
                        onChange={toggleTheme}
                        icon={<Brightness4Icon/>}
                        checkedIcon={<Brightness7Icon/>}
                        color="default"
                    />
                    {!currentLivestream.hasNoTalentPool &&
                    <Button
                        children={userIsInTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'}
                        variant="contained"
                        className={classes.joinButton}
                        startIcon={<PeopleAltIcon/>}
                        icon={userIsInTalentPool ? 'delete' : 'handshake outline'}
                        onClick={userIsInTalentPool ? () => leaveTalentPool() : () => joinTalentPool()}
                        color={userIsInTalentPool ? "default" : "primary"}/>}
                </Toolbar>
            </AppBar>}
            <div className={clsx({
                [classes.blackFrame]: true,
                [classes.withMenu]: showMenu
            })}>
                <ViewerComponent
                    livestreamId={livestreamId} streamerId={`${authenticatedUser?.email}${livestreamId}`}
                    currentLivestream={currentLivestream} handRaiseActive={handRaiseActive}
                    setHandRaiseActive={setHandRaiseActive} showVideoButton={showVideoButton}
                    setShowVideoButton={setShowVideoButton} unmute={unmute} play={play}/>

                {width >= 768 &&
                <MiniChatContainer className={classes.miniChatContainer} livestream={currentLivestream}
                                   isStreamer={false}/>}

                <EmoteButtons
                    handRaiseActive={handRaiseActive}
                    handleClose={handleClose}
                    handleClap={handleClap}
                    handleHeart={handleHeart}
                    handleLike={handleLike}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    iconsDisabled={iconsDisabled}
                    setIconsDisabled={setIconsDisabled}
                    delay={DELAY}
                    smoothness={2}
                    open={open}
                />
            </div>
            <LeftMenu
                className={classes.menuLeft}
                handRaiseActive={handRaiseActive}
                setHandRaiseActive={setHandRaiseActive}
                streamer={false}
                userData={userData}
                user={authenticatedUser}
                livestream={currentLivestream}
                showMenu={showMenu}
                setShowMenu={setShowMenu}
                isMobile={width < 768}
                toggleShowMenu={toggleShowMenu}/>
            <IconsContainer className={classes.iconsContainer}
                            isTest={currentLivestream.test}
                            livestreamId={currentLivestream.id}/>
            {currentLivestream && !currentLivestream.hasNoRatings &&
            <RatingContainer livestreamId={currentLivestream.id}
                             livestream={currentLivestream}/>}
            <Backdrop
                open={Boolean(showVideoButton.muted)}
                className={classes.backdrop}
                onClick={unmuteVideos}>
                <div className={classes.backdropContent}>
                    <VolumeUpRoundedIcon style={{fontSize: '3rem'}}/>
                    <div>Click to unmute</div>
                </div>
            </Backdrop>
            <Backdrop
                open={Boolean(showVideoButton.paused)}
                className={classes.backdrop}
                onClick={playVideos}>
                <div className={classes.backdropContent}>
                    <PlayArrowRoundedIcon style={{fontSize: '3rem'}}/>
                    <div>Click to play</div>
                </div>
            </Backdrop>
        </div>
    );
}

export default withFirebasePage(ViewerPage);