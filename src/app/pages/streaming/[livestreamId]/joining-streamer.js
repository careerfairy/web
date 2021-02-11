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
}));

function StreamingPage(props) {

    const theme = useTheme()
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
            <PreparationOverlay livestream={currentLivestream} setStreamerReady={setStreamerReady}/>
        )
    }

    return (
            <NotificationsContext.Provider value={{setNewNotification: setNewNotification}}>
                <div >
                    <AppBar elevation={1} color="transparent">
                        <Toolbar className={classes.toolbar}>
                            <Hidden smDown>
                                <MainLogo/>
                            </Hidden>
                            <Hidden mdUp>
                                <MiniLogo/>
                            </Hidden>
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
                        <VideoContainer currentLivestream={currentLivestream} streamerId={streamerId} viewer={false} setNumberOfViewers={setNumberOfViewers} />
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
                    <style jsx>{`
                    .top-menu {
                        position: relative;
                        background-color: rgba(245,245,245,1);
                        padding: 15px 0;
                        height: 55px;
                        text-align: center;
                    }

                    .top-menu.active {
                        color: rgba(0, 210, 170, 1);
                    }

                    .top-menu h3 {
                        font-weight: 600;
                    }

                    .video-menu-left {
                        position: absolute;
                        top: 55px;
                        left: 0;
                        bottom: 0;
                        z-index: 20;
                    }

                    .side-button {
                        cursor: pointer;
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