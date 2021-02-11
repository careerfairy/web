import React, {useEffect, useState} from 'react';
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
import {Badge, Button, Hidden, Tooltip} from "@material-ui/core";
import {StandartTooltip, TooltipButtonComponent, TooltipText, TooltipTitle} from 'materialUI/GlobalTooltips';
import PreparationOverlay from 'components/views/streaming/preparation-overlay/PreparationOverlay';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import {MainLogo, MiniLogo} from "../../../components/logos";
import Box from "@material-ui/core/Box";
import Checkbox from "@material-ui/core/Checkbox";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
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
        zIndex: 20,
        boxShadow: theme.shadows[10]
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
    },
    miniChatContainer: {
        position: "absolute",
        bottom: "0",
        right: "120px",
        width: "20%",
        minWidth: "250px",
        zIndex: 100
    },
    iconsContainer: {
        position: "absolute",
        bottom: "50px",
        right: "130px",
        zIndex: 100,
        width: "80px"
    }
}));

function StreamingPage(props) {
    const theme = useTheme()
    const {toggleTheme, themeMode} = useThemeToggle()
    const mobile = useMediaQuery(theme.breakpoints.down('md'))
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
                        <Hidden smDown>
                            <MainLogo/>
                        </Hidden>
                        <Hidden mdUp>
                            <MiniLogo/>
                        </Hidden>
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
                                hasStarted={currentLivestream.hasStarted}
                                mobile={mobile}
                                disabled={!streamStartTimeIsNow}
                                startIcon={currentLivestream.hasStarted ? <StopIcon/> : <PlayCircleFilledWhiteIcon/>}
                                buttonAction={() => setStreamingStarted(!currentLivestream.hasStarted)}
                                confirmDescription={currentLivestream.hasStarted ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'}
                                buttonLabel={currentLivestream.hasStarted ? 'Stop Streaming' : 'Start Streaming'}/>
                        </StandartTooltip>
                        {mobile ?
                            <Tooltip title="Invite an additional streamer">
                                <IconButton onClick={() => {
                                    setSpeakerManagementOpen(true)
                                }}>
                                    <PersonAddIcon color="inherit"/>
                                </IconButton>
                            </Tooltip>
                            :
                            <Button
                                children="Invite a streamer"
                                startIcon={<PersonAddIcon color="inherit"/>}
                                onClick={() => {
                                    setSpeakerManagementOpen(true)
                                }}
                            />}
                        {mobile ?
                            <Tooltip
                                title={currentLivestream.hasStarted ? 'You are currently actively streaming' : 'You are currently not streaming'}>
                                <Typography className={classes.streamStatusText} variant="h5">
                                    {currentLivestream.hasStarted ? 'LIVE' : 'NOT LIVE'}
                                </Typography>
                            </Tooltip>
                            :
                            <Box display="flex" flexDirection="column" justifyContent="center">
                                <Typography className={classes.streamStatusText} variant="h5">
                                    {currentLivestream.hasStarted ? 'YOU ARE LIVE' : 'YOU ARE NOT LIVE'}
                                </Typography>
                                {currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
                            </Box>}
                        {mobile ?
                            <Tooltip title="Open Student View">
                                <IconButton target="_blank" href={`/streaming/${currentLivestream.id}/viewer`}>
                                    <OpenInBrowserIcon color="inherit"/>
                                </IconButton>
                            </Tooltip>
                            :
                            <Button
                                href={`/streaming/${currentLivestream.id}/viewer`}
                                target="_blank"
                                children="Open Student View"
                                startIcon={<OpenInBrowserIcon color="inherit"/>}
                            />
                        }
                        <Tooltip title={themeMode === "dark" ? "Switch to light theme" : "Switch to dark mode"}>
                            <Checkbox
                                checked={themeMode === "dark"}
                                onChange={toggleTheme}
                                icon={<Brightness4Icon/>}
                                checkedIcon={<Brightness7Icon/>}
                                color="default"
                            />
                        </Tooltip>
                        <Box className={classes.viewCount}>
                            <Tooltip title="Number of viewers">
                                <Badge color="secondary" badgeContent={mobile ? numberOfViewers : 0}>
                                    <PeopleIcon/>
                                </Badge>
                            </Tooltip>
                            {!mobile &&
                            <Typography className={classes.viewCountText}>
                                Viewers : {numberOfViewers}
                            </Typography>}
                        </Box>
                    </Toolbar>
                </AppBar>
                <div className={classes.blackFrame}>
                    <VideoContainer currentLivestream={currentLivestream} streamerId={currentLivestream.id}
                                    setNumberOfViewers={setNumberOfViewers} showMenu={showMenu} viewer={false}/>
                </div>
                <LeftMenu
                    className={classes.menuLeft}
                    streamer
                    livestream={currentLivestream}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    toggleShowMenu={toggleShowMenu}/>
                <MiniChatContainer className={classes.miniChatContainer} livestream={currentLivestream}
                                   isStreamer={true}/>
                <IconsContainer className={classes.iconsContainer} isTest={currentLivestream.test}
                                livestreamId={currentLivestream.id}/>
                <NotificationsContainer notifications={notifications}/>
                <SpeakerManagementModal livestreamId={currentLivestream.id} open={speakerManagementOpen}
                                        joiningStreamerLink={joiningStreamerLink}
                                        setOpen={setSpeakerManagementOpen}/>
            </div>
        </NotificationsContext.Provider>
    );
}

export default withFirebasePage(StreamingPage);