import React, {useEffect, useRef} from 'react';
import {DialogContent, MenuItem, Select} from "@material-ui/core";
import {Button, Grid, Icon} from "semantic-ui-react";
import SoundLevelDisplayer from "../../../common/SoundLevelDisplayer";

const Step4Mic = ({audioLevel, audioSource, devices, setAudioSource, setPlaySound, playSound, localStream, speakerSource, attachSinkId, handleNext}) => {

    const handleChangeMic = (event) => {
        setAudioSource(event.target.value)
    }

    const testAudioRef = useRef(null);
    useEffect(() => {
        if (localStream) {
            testAudioRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (speakerSource && testAudioRef) {
            attachSinkId(testAudioRef.current, speakerSource)
        }
    }, [speakerSource, testAudioRef])


    return (
        <DialogContent>
            <Select
                labelId="Microphone Select"
                id="mic-select"
                value={audioSource}
                onChange={handleChangeMic}
            >
                {devices.audioInputList.map(device => {
                    return (<MenuItem value={device.value}>{device.text}</MenuItem>)
                })}
            </Select>
            <Grid.Column>
                <div style={{padding: '20px 0', textAlign: 'center'}}>
                    <div style={{fontWeight: '600', marginBottom: '10px', color: 'pink'}}>Microphone Volume
                    </div>
                    <p style={{fontWeight: '300', marginBottom: '15px', fontSize: '0.8em'}}>Please speak
                        into
                        the microphone to test the audio capture</p>
                    <SoundLevelDisplayer audioLevel={audioLevel} style={{margin: '20px auto'}}/>
                    <audio style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                           ref={testAudioRef} muted={playSound} autoPlay/>
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
        </DialogContent>
    );
};

export default Step4Mic;
