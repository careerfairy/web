import React, {useState, useEffect, Fragment} from 'react';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import {withFirebasePage} from 'context/firebase';
import ButtonWithConfirm from 'components/views/common/ButtonWithConfirm';
import {useRouter} from 'next/router';
import SpeakerManagementModal from 'components/views/streaming/modal/SpeakerManagementModal';
import VideoContainer from 'components/views/streaming/video-container/VideoContainer';
import MiniChatContainer from 'components/views/streaming/LeftMenu/categories/chat/MiniChatContainer';
import {useNumberOfViewers} from 'components/custom-hook/useNumberOfViewers';
import IconsContainer from 'components/views/streaming/icons-container/IconsContainer';
import NotificationsContainer from 'components/views/streaming/notifications-container/NotificationsContainer';
import NotificationsContext from 'context/notifications/NotificationsContext';
import {makeStyles, useTheme} from "@material-ui/core/styles";
import LeftMenu from "../../../components/views/streaming/LeftMenu/LeftMenu";
import {Button} from "@material-ui/core";

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
}));

function StreamingPage(props) {
    const theme = useTheme()

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [currentLivestream, setCurrentLivestream] = useState(false);
    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);
    const [showMenu, setShowMenu] = useState(true);
    const classes = useStyles({showMenu})

    const [newNotification, setNewNotification] = useState(null);
    const [notificationToRemove, setNotificationToRemove] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [joiningStreamerLink, setJoiningStreamerLink] = useState("")

    const [speakerManagementOpen, setSpeakerManagementOpen] = useState(false);

    const numberOfViewers = useNumberOfViewers(currentLivestream);

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

    return (
            <NotificationsContext.Provider value={{setNewNotification, setNotificationToRemove}}>
                <div>
                    <div className={'top-menu ' + (currentLivestream.hasStarted ? 'active' : '')}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '20px',
                            transform: 'translateY(-50%)',
                            verticalAlign: 'middle'
                        }}>
                            <ButtonWithConfirm
                                color={currentLivestream.hasStarted ? theme.palette.error.main : theme.palette.primary.main}
                                fluid
                                disabled={!streamStartTimeIsNow}
                                buttonAction={() => setStreamingStarted(!currentLivestream.hasStarted)}
                                confirmDescription={currentLivestream.hasStarted ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'}
                                buttonLabel={currentLivestream.hasStarted ? 'Stop Streaming' : 'Start Streaming'}/>
                        </div>
                        <Button
                            children="Invite additional streamer"
                            startIcon={<PersonAddIcon color="inherit"/>}
                            onClick={() => {
                                setSpeakerManagementOpen(true)
                            }}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                color: 'rgb(80,80,80)',
                                left: '220px',
                                transform: 'translateY(-50%)',
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'inline-block',
                            padding: '10px',
                            verticalAlign: 'middle',
                            fontSize: '0.9em'
                        }}>
                            <h3 style={{color: (currentLivestream.hasStarted ? 'rgb(0, 210, 170)' : 'orange')}}>{currentLivestream.hasStarted ? 'YOU ARE LIVE' : 'YOU ARE NOT LIVE'}</h3>
                            {currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
                        </div>
                        <Button
                            href={`/streaming/${currentLivestream.id}/viewer`}
                            target="_blank"
                            children="Open Student View"
                            startIcon={<OpenInBrowserIcon color="inherit"/>}
                            style={{
                                color: 'rgb(80,80,80)',
                                position: 'absolute',
                                top: '50%',
                                right: '130px',
                                transform: 'translateY(-50%)'
                            }}
                        />
                        <div style={{
                            float: 'right',
                            margin: '0 20px',
                            fontSize: '1em',
                            padding: '3px',
                            verticalAlign: 'middle',
                            fontWeight: '700'
                        }}>
                            Viewers: {numberOfViewers}
                        </div>
                    </div>
                    <div className={classes.blackFrame}>
                        <VideoContainer currentLivestream={currentLivestream} streamerId={currentLivestream.id}
                                        showMenu={showMenu} viewer={false}/>
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
                        background-color: rgba(245,245,245,1);
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
                        minWidth: 400px;
                        maxWidth: 500px;
                        z-index: 200;
                        padding: 10px 0;
                    }
                `}</style>
                </div>
            </NotificationsContext.Provider>
    );
}

export default withFirebasePage(StreamingPage);