import React, {useEffect, useRef} from 'react';
import {Button, Dropdown, Grid, Icon} from "semantic-ui-react";
import SoundLevelDisplayer from "../../../common/SoundLevelDisplayer";
import {DialogContent, MenuItem, Select} from "@material-ui/core";

const Step2Camera = ({videoSource, devices, setVideoSource, audioSource, setAudioSource, playSound, setPlaySound, setStreamerReady, audioLevel, localStream}) => {
    const testVideoRef = useRef(null);
    useEffect(() => {
        if (localStream) {
            testVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const handleChangeMic = (event) => {
        setAudioSource(event.target.value)
    }

    return (
        <DialogContent>
            <h3>Audio & Video</h3>
            <p>Please select your camera and microphone for this stream:</p>
            <Grid columns={2}>
                <Grid.Column>
                    <Dropdown fluid selection value={videoSource}
                              onChange={(event, {value}) => setVideoSource(value)}
                              options={devices.videoDeviceList} style={{margin: '0 0 15px 0'}}/>
                    <div>
                        <video style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                               ref={testVideoRef} muted={playSound} autoPlay width={'100%'}/>
                    </div>
                </Grid.Column>
                <Grid.Column>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={audioSource}
                        onChange={handleChangeMic}
                    >
                        {devices.audioInputList.map(device => {
                            console.log("device", device);
                            return (<MenuItem value={device.value}>{device.text}</MenuItem>)
                        })}
                    </Select>
                    <div style={{padding: '20px 0', textAlign: 'center'}}>
                        <div style={{fontWeight: '600', marginBottom: '10px', color: 'pink'}}>Microphone Volume
                        </div>
                        <p style={{fontWeight: '300', marginBottom: '15px', fontSize: '0.8em'}}>Please speak
                            into
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
        </DialogContent>
    );
};

export default Step2Camera;
