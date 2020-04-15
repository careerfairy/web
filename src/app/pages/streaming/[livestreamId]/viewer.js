import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { withFirebasePage } from '../../../data/firebase';
import { WebRTCAdaptor } from '../../../static-js/webrtc_adaptor.js';
import axios from 'axios';
import { animateScroll } from 'react-scroll';
import ButtonWithConfirm from '../../../components/views/common/ButtonWithConfirm';

import CommentContainer from '../../../components/views/streaming/comment-container/NewCommentContainer';
import Loader from '../../../components/views/loader/Loader';
import { useRouter } from 'next/router';
import { WEBRTC_ERRORS } from '../../../data/errors/StreamingErrors';
import ReactMic from '../../../components/ssr/ReactMic';
import useUserMedia from '../../../components/custom-hook/useDevices';
import useWebRTCAdaptor from '../../../components/custom-hook/useWebRTCAdaptor';
import RemoteVideoContainer from '../../../components/views/streaming/video-container/RemoteVideoContainer';

function ViewerPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;
    const [currentState, setCurrentState] = useState(2);

    const [isInitialized, setIsInitialized] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isCapturingDesktop, setIsCapturingDesktop] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);
    const [currentLivestream, setCurrentLivestream] = useState(null);

    const [streamId, setStreamId] = useState(null);

    const [mediaConstraints, setMediaConstraints] = useState(null);

    const isPlayMode = true;
    const localVideoId = 'localVideo';

    let streamingCallbacks = {
        onInitialized: () => {
            setIsInitialized(true);
        },
        onJoinedRoom: (infoObj) => {
            //playExisitingStreams(infoObj);
        },
        onStreamJoined: (infoObj) => {
            //playAdditionalStream(infoObj);
        },
        onStreamLeaved: (infoObj) => {
            // removeStream(infoObj);
        },
        onNewStreamAvailable: (infoObj) => {
            //addStreamToVideo(infoObj, externalMediaStreams);
        },
        onPublishStarted: () => {
            setIsStreaming(true);
        },
        onPublishFinished: () => {
            setIsStreaming(false);
        },
        onScreenShareStopped: () => {
            setIsCapturingDesktop(false);
        },
        onClosed: () => {
            setIsInitialized(false);
        },
        onUpdatedStats: () => {},
    }

    let errorCallbacks = {
        onScreenSharePermissionDenied: () => {
            setIsCapturingDesktop(false);
        },
    }

    const { webRTCAdaptor, externalMediaStreams } = 
        useWebRTCAdaptor(
            isPlayMode,
            localVideoId,
            mediaConstraints,
            streamingCallbacks,
            errorCallbacks
        );

    useEffect(() => {
        if (isInitialized) {
            setTimeout(() => {
                webRTCAdaptor.joinRoom(livestreamId, livestreamId + 'mainSpeaker');
            }, 2000);
        }
    },[isInitialized])

    useEffect(() => {
        const constraints = {
            audio: true,
            video: { 
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                aspectRatio: 1.77,   
            }
          };
        setMediaConstraints(constraints);
    },[]);

    function startStreaming() {
    }

    function stopStreaming() {
    }

    function toggleScreenSharing() {
        if (isCapturingDesktop) {
            webRTCAdaptor.switchVideoCapture(streamId);
        } else {
            webRTCAdaptor.switchDesktopCaptureWithCamera(streamId);
        }
        setIsCapturingDesktop(!isCapturingDesktop);
    }

    function toggleMicrophone() {
        if (isLocalMicMuted) {
            webRTCAdaptor.unmuteLocalMic();
        } else {
            webRTCAdaptor.muteLocalMic();
        }
        setIsLocalMicMuted(!isLocalMicMuted);
    }

    let externalVideoElements = externalMediaStreams.map( (streamObject, index) => {
        return (
            <Grid.Column width={8} style={{ padding: 0 }} key={streamObject.streamId}>
                <div className='video-container'>   
                    <RemoteVideoContainer stream={streamObject} length={externalMediaStreams.length} index={index} />
                </div>
            </Grid.Column>
        );
    });

    return (
        <div className='topLevelContainer'>
            <div className='black-frame'>
                <Grid style={{ margin: 0 }}>
                    <Grid.Column width={ externalMediaStreams.length > 0 ? 8 : 16} style={{ padding: 0 }}>
                        <div className='video-container' style={{ height: externalMediaStreams.length > 1 ? '50vh' : '100vh'}}>
                            <video id="localVideo" autoPlay width={ externalMediaStreams.length > 1 ? '' : '100%' } style={{ right: (externalMediaStreams.length > 0) ? '0' : '' }}></video> 
                        </div>
                    </Grid.Column>
                    { externalVideoElements }
                </Grid>
            </div>
            <div className='bottom-container'>
                <div className='button-container'>         
                    <Grid centered className='middle aligned'>
                        <Grid.Column width={6} textAlign='center'>
                            <Button
                                fluid
                                content={ isStreaming ? 'End Live Stream' : 'Begin Live Stream'}
                                primary
                                onClick={  isStreaming ? stopStreaming : startStreaming }
                                disabled={!isInitialized}
                                size='big'
                            />
                        </Grid.Column>
                    </Grid>
                </div>
                <div className='logo-container'>
                    CareerFairy
                    <p>{ JSON.stringify(externalMediaStreams) }</p>
                </div>
            </div>
            <div className='left-container'>
                    <Grid columns={1}>
                        <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => toggleMicrophone()} style={{  color: isLocalMicMuted ? 'red' : 'white' }}>
                                    <Icon name='microphone slash' size='large' style={{ margin: '0 0 5px 0'}}/>
                                    <p style={{ fontSize: '0.8em' }}>{ isLocalMicMuted ? 'Unmute' : 'Mute' }</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => alert("blob")}>
                                    <Icon name='clone outline' size='large' style={{ margin: '0 0 5px 0', color: 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Share Slides</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => toggleScreenSharing()}style={{  color: isCapturingDesktop ? 'red' : 'white' }}>
                                    <Icon name='tv' size='large' style={{ margin: '0 0 5px 0' }}/>
                                    <p style={{ fontSize: '0.8em' }}>{ isCapturingDesktop ? 'Stop Screen Sharing' : 'Share Screen' }</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => alert("blob")}>
                                    <Icon name='user plus' size='large' style={{ margin: '0 0 5px 0', color: 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Invite Speaker: {externalMediaStreams.length}</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row style={{ margin: '10px 0'}}>
                            <Grid.Column textAlign='center'>
                                <div className='side-button' onClick={() => alert("blob")}>
                                    <Icon name='cog' size='large' style={{ margin: '0 0 5px 0', color: 'white'}}/>
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Settings</p>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
            <style jsx>{`
                .hidden {
                    display: none
                }

                .top-menu {
                    text-align: center;
                    padding: 20px;
                    margin: 0 0 30px 0;
                }

                .remoteVideoContainer {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translate(-50%);
                    width: 80%;
                    height: 200px;
                }

                .video-container {
                    position: relative;
                    background-color: black;
                    width: 100%;
                    margin: 0 auto;
                    z-index: -9999;
                }

                #localVideo {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    max-height: 100%;
                    height: auto;
                    z-index: 9900;
                    background-color: black;
                }

                .side-button {
                    cursor: pointer;
                }

                .test-title {
                    font-size: 2em;
                    margin: 30px 0;
                }

                .test-button {
                    margin: 20px 0;
                }

                .test-hint {
                    margin: 20px 0;
                }

                .teal {
                    color: rgb(0, 210, 170);
                    font-weight: 700;
                }

                .black-frame {
                    position: absolute;
                    top: 0;
                    left: 120px;
                    width: calc(100% - 120px);
                    min-width: 700px;
                    height: 100%;
                    min-height: 600px;
                    z-index: -10;
                    background-color: black;
                    cursor: pointer;
                }

                .video-container {
                    
                }

                .button-container {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    height: 90px;
                    cursor:  pointer;
                    padding: 17px;
                    z-index: 8000;
                }

                .left-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100vh;
                    width: 120px;
                    padding: 20px;
                    background-color: rgb(80,80,80);
                }

                .logo-container {
                    position: absolute;
                    bottom: 90px;
                    left: 0;
                    right: 0;
                    color: rgb(0, 210, 170);
                    font-size: 1.4em;
                    text-align: center;
\                }
            `}</style>
        </div>
    );
}

export default ViewerPage;