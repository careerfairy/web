import React, {useState, useEffect, useRef} from 'react';

import {withFirebase} from 'context/firebase';
import {Modal, Input, Icon, Button, Form, Image, Grid, Dropdown} from 'semantic-ui-react';
import {Formik} from 'formik';
import { Dialog,DialogTitle} from '@material-ui/core'
import {useSoundMeter} from 'components/custom-hook/useSoundMeter';
import SoundLevelDisplayer from 'components/views/common/SoundLevelDisplayer';
import useUserMedia from 'components/custom-hook/useDevices';

const StreamPreparationModalV2 = ({
                                    streamerReady,
                                    setStreamerReady,
                                    localStream,
                                    mediaConstraints,
                                    connectionEstablished, setConnectionEstablished, errorMessage, isStreaming, audioSource, setAudioSource, videoSource, setVideoSource
                                }) => {

    const [showAudioVideo, setShowAudioVideo] = useState(false);
    const testVideoRef = useRef(null);

    const devices = useUserMedia(showAudioVideo);
    const audioLevel = useSoundMeter(showAudioVideo, localStream);

    const [playSound, setPlaySound] = useState(true);

    useEffect(() => {
        if (localStream) {
            testVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (!audioSource && devices.audioInputList && devices.audioInputList.length > 0) {
            setAudioSource(devices.audioInputList[0].value);
        }
        if (!videoSource && devices.videoDeviceList && devices.videoDeviceList.length > 0) {
            setVideoSource(devices.videoDeviceList[0].value);
        }
    }, [devices]);

    return (
        <Dialog open={!streamerReady || !connectionEstablished}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          Subscribe
        </DialogTitle>
            <Modal.Header style={{display: (!streamerReady && !connectionEstablished) ? 'block' : 'none'}}>
                <h3 style={{color: 'rgb(0, 210, 170)'}}>CareerFairy Streaming</h3></Modal.Header>
            <Modal.Content
                style={{display: (!streamerReady && !showAudioVideo && !connectionEstablished) ? 'block' : 'none'}}>
                <h3>Preparation</h3>
                <p>Please follow these couple of instructions to ensure a smooth streaming experience:</p>
                <ul className='list'>
                    <li><Icon name='chrome'/>Use the latest Google Chrome desktop browser (v. 80 and newer).</li>
                    <li><Icon name='video'/>Make sure that your browser is authorized to access your webcam and
                        microphone.
                    </li>
                    <li><Icon name='microphone'/>Make sure that your webcam and/or microphone are not currently used by
                        any other application.
                    </li>
                    <li><Icon name='wifi'/>If possible, avoid connecting through any VPN or corporate network with
                        restrictive firewall rules.
                    </li>
                </ul>
                <Button content='Next' primary fluid style={{margin: '40px 0 10px 0'}}
                        onClick={() => setShowAudioVideo(true)}/>
                <p style={{fontSize: '0.8em', color: 'grey'}}>If anything is unclear or not working, please <a
                    href='mailto:thomas@careerfairy.io'>contact us</a>!</p>
            </Modal.Content>
            <Modal.Content
                style={{display: (!streamerReady && showAudioVideo && !connectionEstablished) ? 'block' : 'none'}}>
                <h3>Audio & Video</h3>
                <p>Please select your camera and microphone for this stream:</p>
                <Grid columns={2}>
                    <Grid.Column>
                        <Dropdown fluid selection value={videoSource}
                                  onChange={(event, {value}) => setVideoSource(value)}
                                  options={devices.videoDeviceList} style={{margin: '0 0 15px 0'}}/>
                        <div>
                            <video style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                                   ref={testVideoRef} muted={playSound} autoPlay width={'100%'}></video>
                        </div>
                    </Grid.Column>
                    <Grid.Column>
                        <Dropdown fluid selection value={audioSource}
                                  onChange={(event, {value}) => setAudioSource(value)}
                                  options={devices.audioInputList} style={{margin: '0 0 15px 0'}}/>
                        <div style={{padding: '20px 0', textAlign: 'center'}}>
                            <div style={{fontWeight: '600', marginBottom: '10px', color: 'pink'}}>Microphone Volume
                            </div>
                            <p style={{fontWeight: '300', marginBottom: '15px', fontSize: '0.8em'}}>Please speak into
                                the microphone to test the audio capture</p>
                            <SoundLevelDisplayer audioLevel={audioLevel} style={{margin: '20px auto'}}/>
                            <div style={{marginTop: '30px'}}>
                                <p style={{fontWeight: '300', marginBottom: '5px', fontSize: '0.8em'}}>Listen to the
                                    playback of your microphone:</p>
                                <Button content={!playSound ? 'Stop microphone test' : 'Test microphone'}
                                        icon={!playSound ? 'pause' : 'play'} color='pink'
                                        onClick={() => setPlaySound(!playSound)} size={'mini'}
                                        style={{marginTop: '10px'}}/>
                                <p style={{
                                    marginTop: '5px',
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    fontSize: '0.8em',
                                    color: 'pink'
                                }}><Icon name='headphones' color='pink'/>USE HEADPHONES!</p>
                            </div>
                        </div>
                    </Grid.Column>
                </Grid>
                <Button content='Connect to CareerFairy' primary fluid style={{margin: '10px 0 10px 0'}}
                        onClick={() => {
                            setStreamerReady(true)
                        }}/>
                <p>Don't worry, your stream will not start until you decide to.</p>
                <p style={{fontSize: '0.8em', color: 'grey'}}>If anything is unclear or not working, please <a
                    href='mailto:thomas@careerfairy.io'>contact us</a>!</p>
            </Modal.Content>
            <Modal.Content style={{
                display: (streamerReady && !connectionEstablished) ? 'block' : 'none',
                textAlign: 'center',
                padding: '40px'
            }}>
                <div
                    style={{display: (streamerReady && !isStreaming && !errorMessage) ? 'block' : 'none'}}>
                    <Image src='/loader.gif' style={{width: '50px', height: 'auto', margin: '0 auto'}}/>
                    <div>Attempting to connect...</div>
                </div>
                <div style={{display: isStreaming ? 'block' : 'none'}}>
                    <Icon name='check circle outline'
                          style={{color: 'rgb(0, 210, 170)', fontSize: '3em', margin: '0 auto'}}/>
                    <h3>You are ready to stream!</h3>
                    <div>Your stream will go live once you press "Start Streaming".</div>
                    <Button content='Continue' style={{marginTop: '20px'}} primary
                            onClick={() => setConnectionEstablished(true)}/>
                </div>
                <div style={{display: errorMessage ? 'block' : 'none'}}>
                    <Icon name='frown outline' style={{color: 'rgb(240, 30, 0)', fontSize: '3em', margin: '0 auto'}}/>
                    <h3>An error occured with the following message:</h3>
                    <div>{errorMessage}</div>
                    <Button content='Try again' style={{margin: '20px 0'}} primary onClick={() => {
                        window.location.reload(false)
                    }}/>
                    <p>If anything is unclear or not working, please <a href='mailto:thomas@careerfairy.io'>contact
                        us</a>!</p>
                </div>
            </Modal.Content>
        </Dialog>
    );
}

export default withFirebase(StreamPreparationModalV2);