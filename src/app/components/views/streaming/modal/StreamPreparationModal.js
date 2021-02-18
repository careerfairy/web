import React, {useState, useEffect, useRef, useContext, Fragment} from 'react';

import {withFirebase} from 'context/firebase';
import {Modal, Input, Icon, Button, Form, Image, Grid, Dropdown} from 'semantic-ui-react';
import SoundLevelDisplayer from 'components/views/common/SoundLevelDisplayer';
import { CircularProgress, Dialog, DialogContent } from '@material-ui/core';
import {GlassDialog} from "../../../../materialUI/GlobalModals";

function StreamPreparationModal(props) {

    const [showAudioVideo, setShowAudioVideo] = useState(true);

    const testVideoRef = useRef(null);
    const [playSound, setPlaySound] = useState(true);

    useEffect(() => {
        if (props.localStream) {
            testVideoRef.current.srcObject = props.localStream;
        }
    }, [props.localStream]);

    return (
        <GlassDialog open={!props.streamerReady && !props.connectionEstablished}>
            <DialogContent> 
                {
                    props.localStream ? 
                        <Fragment>
                            <h3>Audio & Video</h3>
                            <p>Please select your camera and microphone for this stream:</p>
                            <Grid columns={2}>
                                <Grid.Column>
                                    <Dropdown fluid selection value={props.videoSource}
                                            onChange={(event, {value}) => props.updateVideoSource(value)}
                                            options={props.devices.videoDeviceList} style={{margin: '0 0 15px 0'}}/>
                                    <div>
                                        <video style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                                            ref={testVideoRef} muted={playSound} autoPlay width={'100%'}></video>
                                    </div>
                                </Grid.Column>
                                <Grid.Column>
                                    <Dropdown fluid selection value={props.audioSource}
                                            onChange={(event, {value}) => props.updateAudioSource(value)}
                                            options={props.devices.audioInputList} style={{margin: '0 0 15px 0'}}/>
                                    <div style={{padding: '20px 0', textAlign: 'center'}}>
                                        <div style={{fontWeight: '600', marginBottom: '10px', color: 'pink'}}>Microphone Volume
                                        </div>
                                        <p style={{fontWeight: '300', marginBottom: '15px', fontSize: '0.8em'}}>Please speak into
                                            the microphone to test the audio capture</p>
                                        <SoundLevelDisplayer audioLevel={props.audioLevel} style={{margin: '20px auto'}}/>
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
                            <Button content={props.localStream ? 'Connect to CareerFairy' : 'Waiting for your camera...'} disabled={!props.localStream} primary fluid style={{margin: '10px 0 10px 0'}}
                                    onClick={() => {
                                        props.setStreamerReady(true)
                                    }}/>
                        </Fragment> : 
                        <div style={{ width: '400px', height: '80px'}}>
                            <div style={{ position: 'absolute', width: '30%', maxWidth: '30px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                                <CircularProgress style={{ maxWidth: '30px', height: 'auto'}} />
                            </div>
                        </div>           
                        }
            </DialogContent>
        </GlassDialog>
    );
}

export default withFirebase(StreamPreparationModal);