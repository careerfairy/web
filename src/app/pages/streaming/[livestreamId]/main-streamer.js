import {useState, useEffect, useRef, Fragment} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { withFirebasePage } from '../../../data/firebase';

import { useRouter } from 'next/router';
import useUserMedia from '../../../components/custom-hook/useDevices';
import useWebRTCAdaptor from '../../../components/custom-hook/useWebRTCAdaptor';
import RemoteVideoContainer from '../../../components/views/streaming/video-container/RemoteVideoContainer';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [isInitialized, setIsInitialized] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isCapturingDesktop, setIsCapturingDesktop] = useState(false);
    const [isLocalMicMuted, setIsLocalMicMuted] = useState(false);

    const devices = useUserMedia();

    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);

    const [mediaConstraints, setMediaConstraints] = useState(null);

    const localVideoId = 'localVideo';

    let streamingCallbacks = {
        onInitialized: (infoObj) => {
            setIsInitialized(true);
        },
        onPublishStarted: (infoObj) => {
            setMainStreamIdToStreamerList(infoObj.streamId);
            setIsStreaming(true);
        },
        onNewStreamAvailable: (infoObj) => {
            addStreamIdToStreamerList(infoObj.streamId);
        },
        onStreamLeaved: (infoObj) => {
            removeStreamIdFromStreamerList(infoObj.streamId);
        },
        onPublishFinished: (infoObj) => {
            setIsStreaming(false);
        },
        onScreenShareStopped: (infoObj) => {
            setIsCapturingDesktop(false);
        },
        onClosed: (infoObj) => {
            setIsInitialized(false);
        },
        onUpdatedStats: (infoObj) => {},
    }

    let errorCallbacks = {
        onScreenSharePermissionDenied: () => {
            setIsCapturingDesktop(false);
        },
    }

    const { webRTCAdaptor, externalMediaStreams } = 
        useWebRTCAdaptor(
            localVideoId,
            mediaConstraints,
            streamingCallbacks,
            errorCallbacks
        );

    useEffect(() => {
        if (isInitialized) {
            setTimeout(() => {
                webRTCAdaptor.joinRoom(livestreamId, 'null');
            }, 2000);
        }
    },[isInitialized])

    useEffect(() => {
        if (!audioSource && devices.audioInputList && devices.audioInputList.length > 0) {
            setAudioSource(devices.audioInputList[0].value);
        }
        if (!videoSource && devices.videoDeviceList && devices.videoDeviceList.length > 0) {
            setVideoSource(devices.videoDeviceList[0].value);
        }
    },[devices]);

    useEffect(() => {
        const constraints = {
            audio: {deviceId: audioSource ? {exact: audioSource} : undefined },
            video: { 
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                aspectRatio: 1.77,   
                deviceId: videoSource ? {exact: videoSource} : undefined
            }
          };
        setMediaConstraints(constraints);
    },[audioSource, videoSource]);

    function createNewStreamerLink() {
    }

    function startStreaming() {
    }

    function stopStreaming() {
    }

    function setMainStreamIdToStreamerList (streamId) {
        props.firebase.setMainStreamIdToLivestreamStreamers(livestreamId, streamId);
    }

    function addStreamIdToStreamerList(streamId) {
        props.firebase.addStreamIdToLivestreamStreamers(livestreamId, streamId);
    }

    function removeStreamIdFromStreamerList(streamId) {
        props.firebase.removeStreamIdFromLivestreamStreamers(livestreamId, streamId);
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
                <RemoteVideoContainer stream={streamObject} length={externalMediaStreams.length} index={index} />
            </Grid.Column>
        );
    });

    return (
        <div className='topLevelContainer'>
            <div className='black-frame'>
                <Grid style={{ margin: 0 }}>
                    <Grid.Column width={ externalMediaStreams.length > 0 ? 8 : 16} style={{ padding: 0 }}>
                        <div className='video-container' style={{ height: externalMediaStreams.length > 1 ? '50vh' : '100vh'}}>
                            <video id="localVideo" muted autoPlay width={ externalMediaStreams.length > 1 ? '' : '100%' } style={{ right: (externalMediaStreams.length > 0) ? '0' : '', bottom: (externalMediaStreams.length > 1) ? '0' : '' }}></video> 
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
                                    <p style={{ fontSize: '0.8em', color: 'white' }}>Invite Speaker</p>
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
                    max-width: 100%;
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

export default withFirebasePage(StreamingPage);