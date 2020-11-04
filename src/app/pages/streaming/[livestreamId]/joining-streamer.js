import React, {useState, useEffect} from 'react';

import {withFirebasePage} from 'context/firebase';

import {useRouter} from 'next/router';
import VideoContainer from 'components/views/streaming/video-container/VideoContainer';
import MiniChatContainer from 'components/views/streaming/LeftMenu/categories/chat/MiniChatContainer';
import ButtonWithConfirm from 'components/views/common/ButtonWithConfirm';
import {useNumberOfViewers} from 'components/custom-hook/useNumberOfViewers';
import IconsContainer from 'components/views/streaming/icons-container/IconsContainer';
import NotificationsContext from 'context/notifications/NotificationsContext';
import NotificationsContainer from 'components/views/streaming/notifications-container/NotificationsContainer';
import {v4 as uuidv4} from 'uuid';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import LeftMenu from "../../../components/views/streaming/LeftMenu/LeftMenu";
import {initialTutorialState} from "./main-streamer";
import TutorialContext from "../../../context/tutorials/TutorialContext";

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
    }
}));

function StreamingPage(props) {

    const theme = useTheme()
    const router = useRouter();
    const livestreamId = router.query.livestreamId;
    const [streamerId, setStreamerId] = useState(null)

    const [currentLivestream, setCurrentLivestream] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);
    const [tutorialSteps, setTutorialSteps] = useState(initialTutorialState)
    const [showBubbles, setShowBubbles] = useState(false)

    const [showMenu, setShowMenu] = useState(true);
    const classes = useStyles({showMenu})

    const [newNotification, setNewNotification] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const numberOfViewers = useNumberOfViewers(currentLivestream);

    useEffect(() => {
        if (livestreamId) {
            setStreamerId(livestreamId + uuidv4())
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

    return (
        <TutorialContext.Provider value={{tutorialSteps, setTutorialSteps, showBubbles, setShowBubbles}}>
            <NotificationsContext.Provider value={{setNewNotification: setNewNotification}}>
                <div className='topLevelContainer'>
                    <div className={'top-menu ' + (currentLivestream.hasStarted ? 'active' : '')}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '20px',
                            transform: 'translateY(-50%)',
                            verticalAlign: 'middle'
                        }}>
                        </div>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'inline-block',
                            padding: '10px',
                            verticalAlign: 'middle',
                            fontSize: '0.8em'
                        }}>
                            <h3 style={{color: (currentLivestream.hasStarted ? 'teal' : 'orange')}}>{currentLivestream.hasStarted ? 'YOU ARE LIVE' : 'YOU ARE NOT LIVE'}</h3>
                            {currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
                        </div>
                        <div style={{
                            float: 'right',
                            margin: '0 20px',
                            fontSize: '1em',
                            padding: '3px',
                            verticalAlign: 'middle'
                        }}>
                            Viewers: {numberOfViewers}
                        </div>
                    </div>
                    <div className={classes.blackFrame}>
                        <VideoContainer currentLivestream={currentLivestream} streamerId={streamerId} viewer={false}/>
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
                        minWidth: 400px;
                        maxWidth: 500px;
                        z-index: 200;
                        padding: 10px 0;
                    }
                `}</style>
                </div>
            </NotificationsContext.Provider>
        </TutorialContext.Provider>
    );
}

export default withFirebasePage(StreamingPage);