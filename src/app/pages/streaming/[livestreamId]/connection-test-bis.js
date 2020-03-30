import {useState, useEffect, useRef} from 'react';
import {Container, Button, Grid, Header as SemanticHeader, Icon, Image, Input, Modal, Transition, Dropdown} from "semantic-ui-react";

import { withFirebasePage } from '../../../data/firebase';
import { WebRTCAdaptor } from '../../../static-js/webrtc_adaptor_new.js';
import axios from 'axios';
import { animateScroll } from 'react-scroll';
import ButtonWithConfirm from '../../../components/views/common/ButtonWithConfirm';

import CommentContainer from '../../../components/views/streaming/comment-container/NewCommentContainer';
import Loader from '../../../components/views/loader/Loader';
import { useRouter } from 'next/router';
import { WEBRTC_ERRORS } from '../../../data/errors/StreamingErrors';
import ReactMic from '../../../components/ssr/ReactMic';
import useUserMedia from '../../../components/custom-hook/useDevices';

function StreamingPage(props) {

    const router = useRouter();
    const livestreamId = router.query.livestreamId;

    const [audioSource, setAudioSource] = useState(null);
    const [videoSource, setVideoSource] = useState(null);


    const videoElement = useRef(null);
    const devices = useUserMedia();

    const [currentState, setCurrentState] = useState(2);

    useEffect(() => {
        if (currentState === 2) {
            start();
        }
    },[currentState, audioSource, videoSource, videoElement])

    useEffect(() => {
        if (!audioSource && devices.audioInputList && devices.audioInputList.length > 0) {
            setAudioSource(devices.audioInputList[0].value);
        }
        if (!videoSource && devices.videoDeviceList && devices.videoDeviceList.length > 0) {
            setVideoSource(devices.videoDeviceList[0].value);
        }
    },[devices]);

    function gotStream(stream) {
        debugger;
        if (window) {
            window.stream = stream;
        }

        if (videoElement && videoElement.current) {
            videoElement.current.srcObject = stream;
        }
    }

    function handleError(error) {
        console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
      }

    function start() {
        debugger;
        if (window && window.stream) {
            window.stream.getTracks().forEach(track => {
                track.stop();
            });
        }
        const constraints = {
            audio: {deviceId: audioSource ? {exact: audioSource} : undefined },
            video: { 
                width: { ideal: 1920, max: 1920 },
                height: { ideal: 1080, max: 1080 },
                aspectRatio: 1.77,
                deviceId: videoSource ? {exact: videoSource} : undefined
            }
          };
        if (navigator) {
            navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
        }
    }

    function getDeviceName(devices, deviceId) {
        let currentDevice = devices.find(device => {
            return device.deviceId === deviceId;
        });
        if (currentDevice) {
            return currentDevice.text;
        } else {
            return "";
        }
    }

    return (
        <div className='topLevelContainer'>
            <Container textAlign='center'>
                <Transition visible={currentState === 0} animation='scale' duration={500} onHide={() => setCurrentState(1)}>
                    <div className='test-content'>
                        <div className='test-title'>Let's get you set up for streaming!</div>
                        <Button style={{ margin: '40px 0' }} content={"Next"} onClick={() => setCurrentState(null) } size='large' primary/>
                    </div>
                </Transition>
                <Transition visible={currentState === 1} animation='scale' duration={500} onHide={() => setCurrentState(2)}>
                    <div className='test-content'>
                        <div className='test-title'>Get the latest Chrome browser</div>
                        <a href='https://www.google.com/chrome/' target='_blank'><Button icon='chrome' content='Download Chrome' color='blue' size='huge'/></a>
                        <div className='test-hint'>Once installed, copy the link to this page into your new shiny Chrome.</div>
                        <Button style={{ margin: '40px 0' }} content={"I am using the latest Chrome"} icon='check' onClick={() => setCurrentState(null) } size='large' primary/>
                    </div>
                </Transition>
                <Transition visible={currentState === 2} animation='scale' duration={500}>
                    <div className='test-content'>
                        <div className='black-frame'>
                            <div className='video-container'>
                                <video ref={videoElement} id="localVideo" autoPlay muted width="100%"></video> 
                            </div>
                        </div>
                        <div className='button-container'>
                            <Grid centered className='middle aligned' stackable>
                                <Grid.Column mobile={1} tablet={5}>
                                    <Dropdown
                                        button
                                        fluid
                                        className='icon'
                                        floating
                                        labeled
                                        icon='microphone'
                                        options={devices.audioInputList}
                                        value={audioSource}
                                        onChange={(event, {value}) => { debugger; setAudioSource(value)}}
                                        text={getDeviceName(devices.audioInputList, audioSource)}
                                    />
                                </Grid.Column>
                                <Grid.Column width={5}>
                                    <Button
                                        fluid
                                        content='Try Streaming!'
                                        primary
                                        size='big'
                                    />
                                </Grid.Column>
                                <Grid.Column mobile={1} tablet={5}>
                                    <Dropdown
                                        fluid
                                        button
                                        className='icon'
                                        floating
                                        labeled
                                        icon='video'
                                        options={devices.videoDeviceList}
                                        value={videoSource}
                                        onChange={(event, {value}) => setVideoSource(value)}
                                        text={getDeviceName(devices.videoDeviceList, videoSource)}
                                    />
                                </Grid.Column>
                            </Grid>
                        </div>
                        <div className='logo-container'>
                            CareerFairy
                        </div>
                    </div>
                </Transition>
            </Container>
            <style jsx>{`
                .hidden {
                    display: none
                }

                .top-menu {
                    text-align: center;
                    padding: 20px;
                    margin: 0 0 30px 0;
                }

                .video-container {
                    background-color: grey;
                    width: 70%;
                    margin: 0 auto;
                }

                .test-content {
                    padding: 1%;
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
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: -10;
                    background-color: black;
                }

                .video-container {
                    width: 100%;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background-color: black;
                }

                .button-container {
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    background-color: rgb(100,100,100, 0.8);
                    height: 90px;
                    padding: 17px;
                }

                .logo-container {
                    position: absolute;
                    bottom: 110px;
                    left: 0;
                    right: 0;
                    color: rgb(0, 210, 170);
                    font-size: 1.7em;
                }

                @media(max-width: 765px) {
                    .button-container {
                        display:none;
                    }

                    .logo-container {
                        bottom: 40px;
                    }
                }
            `}</style>
        </div>
    );
}

export default StreamingPage;