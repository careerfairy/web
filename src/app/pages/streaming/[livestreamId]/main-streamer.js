import React, {useState, useEffect} from 'react';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import {withFirebasePage} from 'context/firebase';
import ButtonWithConfirm from 'components/views/common/ButtonWithConfirm';
import {useRouter} from 'next/router';
import SpeakerManagementModal from 'components/views/streaming/modal/SpeakerManagementModal';
import VideoContainer from 'components/views/streaming/video-container/VideoContainer';
import MiniChatContainer from 'components/views/streaming/LeftMenu/categories/chat/MiniChatContainer';
import IconsContainer from 'components/views/streaming/icons-container/IconsContainer';
import NotificationsContainer from 'components/views/streaming/notifications-container/NotificationsContainer';
import NotificationsContext from 'context/notifications/NotificationsContext';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import LeftMenu from "../../../components/views/streaming/LeftMenu/LeftMenu";
import {Badge, Button, Paper} from "@material-ui/core";
import {StandartTooltip, TooltipTitle, TooltipText, TooltipButtonComponent} from 'materialUI/GlobalTooltips';
import PreparationOverlay from 'components/views/streaming/preparation-overlay/PreparationOverlay';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import {MainLogo} from "../../../components/logos";
import Box from "@material-ui/core/Box";
import Checkbox from "@material-ui/core/Checkbox";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import PeopleAltIcon from "@material-ui/icons/PeopleAlt";
import StopIcon from '@material-ui/icons/Stop';
import PeopleIcon from '@material-ui/icons/People';
import {useThemeToggle} from "../../../context/theme/ThemeContext";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
    menuLeft: {
        position: "absolute",
        transition: "width 0.3s",
        transitionTimingFunction: theme.transitions.easeInOut,
        width: ({showMenu}) => showMenu ? 280 : 0,
        top: 55,
        left: 0,
        bottom: 0,
        zIndex: 20
    },
    blackFrame: {
        left: ({showMenu}) => showMenu ? 280 : 0,
        transition: "left 0.3s",
        transitionTimingFunction: theme.transitions.easeInOut,
        position: "absolute",
        top: 55,
        right: 0,
        minWidth: 400,
        height: "calc(100% - 55px)",
        zIndex: 10,
        backgroundColor: "black",
    },
    typography: {
        padding: theme.spacing(2),
    },
    toolbar: {
        minHeight: 55,
        display: "flex",
        justifyContent: "space-between"
    },
    viewCount: {
        // background: theme.palette.primary.main,
        color: theme.palette.primary.main,
        padding: theme.spacing(1),
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    viewCountText: {
        fontWeight: 600,
        marginLeft: theme.spacing(0.5)
    },
    streamStatusText: {
        fontWeight: 600,
        color: ({hasStarted}) => hasStarted ? theme.palette.primary.main : theme.palette.warning.main
    }
}));

function StreamingPage(props) {
    const theme = useTheme()
    const {toggleTheme, themeMode} = useThemeToggle()
    const mobile = useMediaQuery(theme.breakpoints.down('md'))
    console.log("-> mobile", mobile);
    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [streamerReady, setStreamerReady] = useState(false);

    const [currentLivestream, setCurrentLivestream] = useState(false);
    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);
    const [showMenu, setShowMenu] = useState(true);
    const classes = useStyles({
        showMenu,
        hasStarted: currentLivestream.hasStarted
    })

    const [newNotification, setNewNotification] = useState(null);
    const [notificationToRemove, setNotificationToRemove] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [joiningStreamerLink, setJoiningStreamerLink] = useState("")
    const [hideTooltip, setHideTooltip] = useState(false);

    const [speakerManagementOpen, setSpeakerManagementOpen] = useState(false);
    const [numberOfViewers, setNumberOfViewers] = useState(0);

    useEffect(() => {
        if (livestreamId) {
            let baseUrl = "https://careerfairy.io"
            if (window?.location?.origin) {
                baseUrl = window.location.origin
            }
            const link = `${baseUrl}/streaming/${livestreamId}/joining-streamer?pwd=qdhwuiehd7qw789d79w8e8dheiuhiqwdu`;
            setJoiningStreamerLink(link)
        }
    }, [livestreamId])

    useEffect(() => {
        if (livestreamId) {
            props.firebase.listenToScheduledLivestreamById(livestreamId, querySnapshot => {
                if (!querySnapshot.isEmpty) {
                    let livestream = querySnapshot.data();
                    livestream.id = querySnapshot.id;
                    setCurrentLivestream(livestream);
                }
            });
        }
    }, [livestreamId]);

    useEffect(() => {
        if (newNotification) {
            setNotifications([...notifications, newNotification]);
        }
    }, [newNotification]);

    useEffect(() => {
        if (notificationToRemove) {
            let updatedNotifications = notifications.filter(not => not.id !== notificationToRemove);
            setNotifications(updatedNotifications);
        }
    }, [notificationToRemove]);

    useEffect(() => {
        if (currentLivestream.start) {
            let interval = setInterval(() => {
                if (dateIsInUnder2Minutes(currentLivestream.start.toDate())) {
                    setStreamStartTimeIsNow(true);
                    clearInterval(interval);
                }
            }, 1000)
        }
    }, [currentLivestream.start]);

    function dateIsInUnder2Minutes(date) {
        return new Date(date).getTime() - Date.now() < 1000 * 60 * 2 || Date.now() > new Date(date).getTime();
    }

    function setStreamingStarted(started) {
        props.firebase.setLivestreamHasStarted(started, currentLivestream.id);
    }

    const toggleShowMenu = () => {
        setShowMenu(!showMenu)
    }

    if (!streamerReady) {
        return (
            <PreparationOverlay livestream={currentLivestream} setStreamerReady={setStreamerReady}/>
        )
    }

    return (
        <NotificationsContext.Provider value={{setNewNotification, setNotificationToRemove}}>
            <div>
                <AppBar elevation={1} color="transparent">
                    <Toolbar className={classes.toolbar}>
                        <MainLogo/>
                        <StandartTooltip
                            arrow
                            open={!streamStartTimeIsNow && !hideTooltip}
                            interactive
                            placement='bottom'
                            title={
                                <React.Fragment>
                                    <TooltipTitle>Start Streaming</TooltipTitle>
                                    <TooltipText>
                                        The Start Streaming button will become active 2 minutes before the stream's
                                        official start time.
                                    </TooltipText>
                                    <TooltipButtonComponent onConfirm={() => setHideTooltip(true)} buttonText="Ok"/>
                                </React.Fragment>
                            }
                        >
                            <ButtonWithConfirm
                                color={currentLivestream.hasStarted ? theme.palette.error.main : theme.palette.primary.main}
                                fluid
                                disabled={!streamStartTimeIsNow}
                                startIcon={currentLivestream.hasStarted ? <StopIcon/> : <PlayCircleFilledWhiteIcon/>}
                                buttonAction={() => setStreamingStarted(!currentLivestream.hasStarted)}
                                confirmDescription={currentLivestream.hasStarted ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'}
                                buttonLabel={currentLivestream.hasStarted ? 'Stop Streaming' : 'Start Streaming'}/>
                        </StandartTooltip>
                        {mobile ?
                            <IconButton onClick={() => {
                                setSpeakerManagementOpen(true)
                            }}>
                                <PersonAddIcon color="inherit"/>
                            </IconButton>
                            :
                            <Button
                                children="Invite additional streamer"
                                startIcon={<PersonAddIcon color="inherit"/>}
                                onClick={() => {
                                    setSpeakerManagementOpen(true)
                                }}
                            />}
                        <Box display="flex" flexDirection="column" justifyContent="center">
                            <Typography className={classes.streamStatusText} variant="h5">
                                {currentLivestream.hasStarted ? 'YOU ARE LIVE' : 'YOU ARE NOT LIVE'}
                            </Typography>
                            {currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
                        </Box>
                        {mobile ?
                            <IconButton target="_blank" href={`/streaming/${currentLivestream.id}/viewer`}>
                                <OpenInBrowserIcon color="inherit"/>
                            </IconButton>
                            :
                            <Button
                                href={`/streaming/${currentLivestream.id}/viewer`}
                                target="_blank"
                                children="Open Student View"
                                startIcon={<OpenInBrowserIcon color="inherit"/>}
                            />
                        }
                        {/*<Box flexGrow={1}/>*/}
                        <Checkbox
                            checked={themeMode === "dark"}
                            onChange={toggleTheme}
                            icon={<Brightness4Icon/>}
                            checkedIcon={<Brightness7Icon/>}
                            color="default"
                        />
                        <Box className={classes.viewCount}>
                            <Badge color="secondary" badgeContent={mobile ? numberOfViewers : 0}>
                                <PeopleIcon/>
                            </Badge>
                            {!mobile &&
                            <Typography className={classes.viewCountText}>
                                Viewers : {numberOfViewers}
                            </Typography>}
                        </Box>
                    </Toolbar>
                </AppBar>
                {/*<div className={'top-menu ' + (currentLivestream.hasStarted ? 'active' : '')}>*/}
                {/*</div>*/}
                <div className={classes.blackFrame}>
                    <VideoContainer currentLivestream={currentLivestream} streamerId={currentLivestream.id}
                                    setNumberOfViewers={setNumberOfViewers} showMenu={showMenu} viewer={false}/>
                </div>
                <div className={classes.menuLeft}>
                    <LeftMenu
                        streamer
                        livestream={currentLivestream}
                        showMenu={showMenu}
                        setShowMenu={setShowMenu}
                        toggleShowMenu={toggleShowMenu}/>
                </div>
                <div className='mini-chat-container'>
                    <MiniChatContainer livestream={currentLivestream} isStreamer={true}/>
                </div>
                <div className='icons-container'>
                    <IconsContainer isTest={currentLivestream.test} livestreamId={currentLivestream.id}/>
                </div>
                <div className='notifications-container'>
                    <NotificationsContainer notifications={notifications}/>
                </div>
                <SpeakerManagementModal livestreamId={currentLivestream.id} open={speakerManagementOpen}
                                        joiningStreamerLink={joiningStreamerLink}
                                        setOpen={setSpeakerManagementOpen}/>
                <style jsx>{`
                  .top-menu {
                    position: relative;
                    background-color: rgba(245, 245, 245, 1);
                    padding: 15px 0;
                    height: 55px;
                    text-align: center;
                    box-shadow: 0 0 4px grey;
                    z-index: 1000;
                  }

                  .top-menu.active {
                    color: rgba(0, 210, 170, 1);
                  }

                  .top-menu h3 {
                    font-weight: 600;
                  }

                  .mini-chat-container {
                    position: absolute;
                    bottom: 0;
                    right: 120px;
                    width: 20%;
                    min-width: 250px;
                    z-index: 100;
                  }

                  .icons-container {
                    position: absolute;
                    bottom: 50px;
                    right: 130px;
                    z-index: 100;
                    width: 80px;
                  }

                  .notifications-container {
                    position: absolute;
                    top: 55px;
                    right: 130px;
                    width: 20%;
                    z-index: 200;
                    padding: 10px 0;
                  }
                `}</style>
            </div>
        </NotificationsContext.Provider>
    );
}

export default withFirebasePage(StreamingPage);