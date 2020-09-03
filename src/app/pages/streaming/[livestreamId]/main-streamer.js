import {useState, useEffect} from 'react';
import { Grid, Icon, Button } from "semantic-ui-react";

import { withFirebasePage } from 'context/firebase';
import { useViewerCount } from 'components/custom-hook/useViewerCount';
import ButtonWithConfirm from 'components/views/common/ButtonWithConfirm';

import { useRouter } from 'next/router';
import NewCommentContainer from 'components/views/streaming/comment-container/NewCommentContainer';
import SpeakerManagementModal from 'components/views/streaming/modal/SpeakerManagementModal';
import VideoContainer from 'components/views/streaming/video-container/VideoContainer';
import MiniChatContainer from 'components/views/streaming/comment-container/categories/chat/MiniChatContainer';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [currentLivestream, setCurrentLivestream] = useState(false);
    const [streamStartTimeIsNow, setStreamStartTimeIsNow] = useState(false);
    const [showSpeakersModal, setShowSpeakersModal] = useState(false);
    const [showMenu, setShowMenu] = useState(true);

    //const numberOfViewers = useViewerCount(currentLivestream);
    let streamingCallbacks = {
        onPublishStarted: (infoObj) => {
            setShowDisconnectionModal(false);
            setIsStreaming(true);
        },
        onPublishFinished: (infoObj) => {
            setIsStreaming(false);
        },
        onDisconnected: (infoObj) => {
            setShowDisconnectionModal(true);
        },
        onConnected: (infoObj) => {
            setShowDisconnectionModal(false);
        },
    }

    let errorCallbacks = {
        onOtherError: (error) => {
            if (typeof error === "string") {
                setErrorMessage(error);
            } else {
                setErrorMessage("A connection error occured");
            }
        }
    }

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

    return (
        <div className='topLevelContainer'>
             {/* <div className={'top-menu ' + (currentLivestream.hasStarted ? 'active' : '')}>
                <div style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', verticalAlign: 'middle'}}>
                    <ButtonWithConfirm
                        color={currentLivestream.hasStarted ? 'red' : 'teal'} 
                        size='big' 
                        fluid
                        disabled={!streamStartTimeIsNow}
                        buttonAction={() => setStreamingStarted(!currentLivestream.hasStarted)} 
                        confirmDescription={currentLivestream.hasStarted ? 'Are you sure that you want to end your livestream now?' : 'Are you sure that you want to start your livestream now?'} 
                        buttonLabel={ currentLivestream.hasStarted ? 'Stop Streaming' : 'Start Streaming' }/>
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'inline-block', padding: '10px', verticalAlign: 'middle'}}>
                    <h3 style={{ color: (currentLivestream.hasStarted ?  'white' : 'orange') }}>{ currentLivestream.hasStarted ? 'YOU ARE NOW LIVE' : 'YOU ARE NOT LIVE'}</h3>
                    { currentLivestream.hasStarted ? '' : 'Press Start Streaming to begin'}
                </div>
                <div style={{ float: 'right', margin: '0 20px', fontSize: '1.2em', fontWeight: '700', padding: '10px', verticalAlign: 'middle'}}>
                    Viewers: { numberOfViewers }
                </div>
            </div> */}
            <div className='black-frame' style={{ left: showMenu ? '280px' : '0'}}>
                <VideoContainer currentLivestream={ currentLivestream } streamerId={ currentLivestream.id } streamingCallbacks={streamingCallbacks} errorCallbacks={errorCallbacks}/>
            </div>
            <div className='video-menu-left' style={{ width: showMenu ? '280px' : '0'}}>
                <NewCommentContainer showMenu={showMenu} setShowMenu={setShowMenu} streamer={true} livestream={ currentLivestream }/>
            </div>
            <div className='mini-chat-container'>
                <MiniChatContainer livestream={ currentLivestream } showMenu={showMenu}/>
            </div>
            <style jsx>{`
                .top-menu {
                    position: relative;
                    background-color: rgba(245,245,245,1);
                    padding: 15px 0;
                    height: 75px;
                    text-align: center;
                }

                .top-menu.active {
                    background-color: rgba(0, 210, 170, 1);
                    color: white;
                }

                .top-menu h3 {
                    font-weight: 600;
                }

                .video-menu-left {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    z-index: 20;
                }

                .side-button {
                    cursor: pointer;
                }

                .black-frame {
                    position: absolute;
                    top: 0;
                    right: 0;
                    min-width: 400px;
                    height: 100%;
                    min-height: 600px;
                    z-index: 10;
                    background-color: black;
                }

                .mini-chat-container {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-60%);
                    right: 130px;
                    width: 20%;
                    min-width: 130px;
                    z-index: 100;
                }

                .right-container {
                    position: absolute;
                    right: 0;
                    top: 0;
                    height: 100%;
                    width: 180px;
                    padding: 20px;
                    background-color: rgb(80,80,80);
                }
            `}</style>
        </div>
    );
}

export default withFirebasePage(StreamingPage);