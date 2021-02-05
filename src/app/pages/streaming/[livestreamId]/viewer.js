import React, {Fragment, useEffect, useState} from 'react';
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
import {Avatar, Switch, useTheme} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from '@material-ui/core/AppBar';
import {MainLogo} from "../../../components/logos";
import Box from "@material-ui/core/Box";
import clsx from "clsx";

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
        touchAction: "manipulation"
    },
    toolbar: {
        minHeight: 55,
        display: "flex",
        justifyContent: "space-between"
    },
    menuLeft: {
        position: "absolute",
        transition: "width 0.3s",
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
}));

const groupLogo = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fethccnew-logo.png?alt=media&token=9d3e2d5a-3517-4fe3-85e6-9600bf8d8bc4"

function ViewerPage({firebase}) {
    const {toggleTheme, themeMode} = useThemeToggle()
    const DELAY = 3000; //3 seconds
    const router = useRouter();
    const livestreamId = router.query.livestreamId;
    const dispatch = useDispatch()
    const [showMenu, setShowMenu] = useState(false);
    const theme = useTheme()

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


    const streamerId = 'ehdwqgdewgzqzuedgquzwedgqwzeugdu';

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
        if (userData && livestreamId) {
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
            <Fragment key={index}>
                <img src={careerCenter.logoUrl}
                     style={{maxWidth: '150px', maxHeight: '50px', marginRight: '15px', display: 'inline-block'}}/>
            </Fragment>
        );
    });

    return (
        <div className={classes.root}>
            {width >= 768 &&
            <AppBar color="transparent" position="static">
                <Toolbar className={classes.toolbar}>
                    <MainLogo/>
                    {logoElements}
                    <Switch
                        checked={themeMode === "dark"}
                        onChange={toggleTheme}
                        color="default"
                    />
                    <Box flexGrow={1}/>
                    <Avatar
                        className={classes.logo}
                        src={groupLogo}
                        variant="rounded"
                    />
                    {!currentLivestream.hasNoTalentPool &&
                    <Button
                        children={userIsInTalentPool ? 'Leave Talent Pool' : 'Join Talent Pool'}
                        variant="contained"
                        startIcon={<PeopleAltIcon/>}
                        icon={userIsInTalentPool ? 'delete' : 'handshake outline'}
                        onClick={userIsInTalentPool ? () => leaveTalentPool() : () => joinTalentPool()}
                        color={userIsInTalentPool ? "default" : "primary"}/>}
                </Toolbar>
            </AppBar>}
            <div
                className={clsx({
                    [classes.blackFrame]: true,
                    [classes.withMenu]: showMenu
                })}
            >

                <ViewerComponent
                    livestreamId={livestreamId} streamerId={streamerId}
                    currentLivestream={currentLivestream} handRaiseActive={handRaiseActive}
                    setHandRaiseActive={setHandRaiseActive} showVideoButton={showVideoButton}
                    setShowVideoButton={setShowVideoButton} unmute={unmute} play={play}/>
                <div className='mini-chat-container'>
                    <MiniChatContainer livestream={currentLivestream} isStreamer={false}/>
                </div>
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
            <div className={classes.menuLeft}>
                <LeftMenu
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
            </div>
            <div className='icons-container'>
                <IconsContainer isTest={currentLivestream.test} livestreamId={currentLivestream.id}/>
            </div>
            {currentLivestream && !currentLivestream.hasNoRatings &&
            <RatingContainer livestreamId={currentLivestream.id} livestream={currentLivestream}/>}
            <div className={'playButtonContent ' + (showVideoButton.muted ? '' : 'hidden')} onClick={unmuteVideos}>
                <div className='playButton'>
                    <VolumeUpRoundedIcon style={{fontSize: '3rem'}}/>
                    <div>Click to unmute</div>
                </div>
            </div>
            <div className={'playButtonContent ' + (showVideoButton.paused ? '' : 'hidden')} onClick={playVideos}>
                <div className='playButton'>
                    <PlayArrowRoundedIcon style={{fontSize: '3rem'}}/>
                    <div>Click to play</div>
                </div>
            </div>
            <style jsx>{`
              .hidden {
                display: none
              }

              .mini-chat-container {
                position: absolute;
                bottom: 0;
                right: 40px;
                width: 20%;
                min-width: 250px;
                z-index: 7250;
              }

              @media (max-width: 768px) {
                .mini-chat-container {
                  display: none;
                }
              }

              .icons-container {
                position: absolute;
                bottom: 50px;
                right: 60px;
                z-index: 100;
                width: 80px;
              }

              .playButton {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-weight: 500;
                text-align: center;
              }

              .playButtonContent {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(10, 10, 10, 0.4);
                cursor: pointer;
                z-index: 200;
              }
            `}</style>
            <style jsx global>{`
              body {
                min-height: 100vh;
              }

              html {
              }
            `}</style>
        </div>
    );
}

export default withFirebasePage(ViewerPage);