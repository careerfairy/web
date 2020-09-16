import {useState, useEffect, useRef} from 'react';
import {Grid, Icon} from "semantic-ui-react";

import { withFirebasePage } from 'context/firebase';

import { useRouter } from 'next/router';
import NewCommentContainer from 'components/views/streaming/comment-container/NewCommentContainer';
import SpeakerManagementModal from 'components/views/streaming/modal/SpeakerManagementModal';
import VideoContainer from 'components/views/streaming/video-container/VideoContainer';
import MiniChatContainer from 'components/views/streaming/comment-container/categories/chat/MiniChatContainer';
import ButtonWithConfirm from 'components/views/common/ButtonWithConfirm';
import { useNumberOfViewers } from 'components/custom-hook/useNumberOfViewers';
import IconsContainer from 'components/views/streaming/icons-container/IconsContainer';
import NotificationsContext from 'context/notifications/NotificationsContext';
import NotificationsContainer from 'components/views/streaming/notifications-container/NotificationsContainer';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;
    const streamerId = router.query.streamerId;

    const [currentLivestream, setCurrentLivestream] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);
    const [showSpeakersModal, setShowSpeakersModal] = useState(false);
    const [showMenu, setShowMenu] = useState(true);

    const [newNotification, setNewNotification] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const numberOfViewers = useNumberOfViewers(currentLivestream);

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
        return new Date(date).getTime() - Date.now() < 1000*60*2 || Date.now() > new Date(date).getTime();
    }

    function setStreamingStarted(started) {
        props.firebase.setLivestreamHasStarted(started, currentLivestream.id);
    }

    function setLivestreamMode(mode) {
        props.firebase.setLivestreamMode(livestreamId, mode);
    }

    function setLivestreamSpeakerSwitchMode(mode) {
        props.firebase.setLivestreamSpeakerSwitchMode(livestreamId, mode);
    }

    function toggleMicrophone() {
        if (isLocalMicMuted) {
            webRTCAdaptor.unmuteLocalMic();
        } else {
            webRTCAdaptor.muteLocalMic();
        }
        setIsLocalMicMuted(!isLocalMicMuted);
    }


    return (
        <NotificationsContext.Provider value={{ setNewNotification: setNewNotification }}>
            <div className='topLevelContainer'>
                <div className={'top-menu ' + (currentLivestream.hasStarted ? 'active' : '')}>
                    <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', verticalAlign: 'middle'}}>
                        <ButtonWithConfirm
                            color={currentLivestream.hasStarted ? 'red' : 'teal'}  
                            fluid
                            disabled={!streamStartTimeIsNow}
                            buttonAction={() => setStreamingStarted(!currentLivestream.hasStarted)} 
                            confirmDescription={currentLivestream.hasStarted ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'} 
                            buttonLabel={ currentLivestream.hasStarted ? 'Stop Streaming' : 'Start Streaming' }/>
                    </div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'inline-block', padding: '10px', verticalAlign: 'middle', fontSize: '0.8em'}}>
                        <h3 style={{ color: (currentLivestream.hasStarted ?  'teal' : 'orange') }}>{ currentLivestream.hasStarted ? 'YOU ARE LIVE' : 'YOU ARE NOT LIVE'}</h3>
                        { currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
                    </div>
                    <div style={{ float: 'right', margin: '0 20px', fontSize: '1em', padding: '3px', verticalAlign: 'middle'}}>
                        Viewers: { numberOfViewers }
                    </div>
                </div>
                <div className='black-frame' style={{ left: showMenu ? '280px' : '0'}}>
                    <VideoContainer currentLivestream={ currentLivestream } streamerId={ streamerId }/>
                </div>
                <div className='video-menu-left' style={{ width: showMenu ? '280px' : '0'}}> 
                    <NewCommentContainer showMenu={showMenu} setShowMenu={setShowMenu} streamer={true} livestream={ currentLivestream }/>
                </div>
                <div className='mini-chat-container'>
                    <MiniChatContainer livestream={ currentLivestream } isStreamer={true}/>
                </div>
                <div className='icons-container'>
                    <IconsContainer livestreamId={ currentLivestream.id } />
                </div>
                <div className='notifications-container'>
                    <NotificationsContainer notifications={notifications} />
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

                    .black-frame {
                        position: absolute;
                        top: 55px;
                        right: 0;
                        min-width: 400px;
                        height: calc(100% - 55px);
                        min-height: 600px;
                        z-index: 10;
                        background-color: black;
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
                        bottom: 0;
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