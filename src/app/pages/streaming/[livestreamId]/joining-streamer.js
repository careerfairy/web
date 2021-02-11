import React, {useEffect, useState} from 'react';
import {withFirebasePage} from 'context/firebase';
import {useRouter} from 'next/router';
import VideoContainer from 'components/views/streaming/video-container/VideoContainer';
import MiniChatContainer from 'components/views/streaming/LeftMenu/categories/chat/MiniChatContainer';
import IconsContainer from 'components/views/streaming/icons-container/IconsContainer';
import NotificationsContext from 'context/notifications/NotificationsContext';
import NotificationsContainer from 'components/views/streaming/notifications-container/NotificationsContainer';
import {v4 as uuidv4} from 'uuid';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import LeftMenu from "../../../components/views/streaming/LeftMenu/LeftMenu";
import PreparationOverlay from 'components/views/streaming/preparation-overlay/PreparationOverlay';
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Toolbar from "@material-ui/core/Toolbar";
import {Badge, Hidden, Tooltip} from "@material-ui/core";
import {MainLogo, MiniLogo} from "../../../components/logos";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import PeopleIcon from "@material-ui/icons/People";
import AppBar from "@material-ui/core/AppBar";
import Checkbox from "@material-ui/core/Checkbox";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import {useThemeToggle} from "../../../context/theme/ThemeContext";

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
        right: "100px",
        zIndex: 100,
        width: "80px"
    }
}));

function StreamingPage(props) {

    const theme = useTheme()
    const {toggleTheme, themeMode} = useThemeToggle()
    const router = useRouter();
    const mobile = useMediaQuery(theme.breakpoints.down('md'))
    const livestreamId = router.query.livestreamId;
    const [streamerId, setStreamerId] = useState(null)

    const [streamerReady, setStreamerReady] = useState(false);

    const [currentLivestream, setCurrentLivestream] = useState(false);
    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);

    const [showMenu, setShowMenu] = useState(true);
    const classes = useStyles({
        showMenu,
        hasStarted: currentLivestream.hasStarted
    })

    const [newNotification, setNewNotification] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [numberOfViewers, setNumberOfViewers] = useState(0);

    useEffect(() => {
        const regex = /-/g;
        if (livestreamId) {
            if (localStorage.getItem('streamingUuid')) {
                let storedUuid = localStorage.getItem('streamingUuid')
                let joiningId = storedUuid.replace(regex, '')
                setStreamerId(livestreamId + joiningId)
            } else {
                let uuid = uuidv4()
                let joiningId = uuid.replace(regex, '')
                localStorage.setItem('streamingUuid', joiningId)
                setStreamerId(livestreamId + joiningId)
            }
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

    const toggleShowMenu = () => {
        setShowMenu(!showMenu)
    }

    if (!streamerReady) {
        return (
            <PreparationOverlay
                livestream={currentLivestream}
                setStreamerReady={setStreamerReady}
            />
        )
    }

    return (
        <NotificationsContext.Provider
            value={{setNewNotification: setNewNotification}}
        >
            <div>
                <AppBar
                    elevation={1}
                    color="transparent">
                    <Toolbar
                        className={classes.toolbar}
                    >
                        <Hidden smDown>
                            <MainLogo/>
                        </Hidden>
                        <Hidden mdUp>
                            <MiniLogo/>
                        </Hidden>
                        {mobile ?
                            <Tooltip
                                title={currentLivestream.hasStarted ? 'You are currently actively streaming' : 'You are currently not streaming'}>
                                <Typography
                                    className={classes.streamStatusText}
                                    variant="h5"
                                >
                                    {currentLivestream.hasStarted ? 'LIVE' : 'NOT LIVE'}
                                </Typography>
                            </Tooltip>
                            :
                            <Box display="flex"
                                 flexDirection="column"
                                 justifyContent="center">
                                <Typography
                                    className={classes.streamStatusText}
                                    variant="h5">
                                    {currentLivestream.hasStarted ? 'YOU ARE LIVE' : 'YOU ARE NOT LIVE'}
                                </Typography>
                                {currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
                            </Box>}
                        <Box display="flex" alignItems="center">
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
                        </Box>
                    </Toolbar>
                </AppBar>
                <div className={classes.blackFrame}>
                    <VideoContainer
                        currentLivestream={currentLivestream}
                        streamerId={streamerId} viewer={false}
                        setNumberOfViewers={setNumberOfViewers}/>
                </div>
                <LeftMenu
                    className={classes.menuLeft}
                    streamer
                    livestream={currentLivestream}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    toggleShowMenu={toggleShowMenu}/>
                <MiniChatContainer
                    className={classes.miniChatContainer}
                    livestream={currentLivestream}
                    isStreamer={true}/>
                <IconsContainer
                    className={classes.iconsContainer}
                    isTest={currentLivestream.test}
                    livestreamId={currentLivestream.id}
                />
                <NotificationsContainer
                    notifications={notifications}
                />
            </div>
        </NotificationsContext.Provider>
    );
}

export default withFirebasePage(StreamingPage);