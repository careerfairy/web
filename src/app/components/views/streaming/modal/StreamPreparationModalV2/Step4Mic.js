import React, {useEffect, useRef, useState} from 'react';
import {DialogContent, MenuItem, Select, Typography} from "@material-ui/core";
import {Button, Grid, Icon} from "semantic-ui-react";
import SoundLevelDisplayer from "../../../common/SoundLevelDisplayer";

const Step4Mic = ({audioLevel, audioSource, devices, setAudioSource, setPlaySound, playSound, localStream, speakerSource, attachSinkId, handleComplete}) => {
    const [localMicrophones, setLocalSpeakers] = useState([])
    const [clickedNo, setClickedNo] = useState(false)
    const [allTested, setAllTested] = useState(false)


    useEffect(() => {
        if (devices && devices.audioInputList && devices.audioInputList.length) {
            const mappedMicrophones = devices.audioInputList.map(speaker => (
                {...speaker, hasBeenChecked: false}
            ))// first speaker in device array is allways selected by default
            mappedMicrophones[0].hasBeenChecked = true
            setLocalSpeakers(mappedMicrophones)
        }
    }, [devices])

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

    useEffect(() => {
        setPlaySound(true)
    }, [])

    const handleChangeMic = (event) => {
        setAudioSource(event.target.value)
    }

    const handleTestAgain = () => {
        setAllTested(false)
        const mappedMicrophones = devices.audioInputList.map(speaker => (
            {...speaker, hasBeenChecked: false}
        ))// first speaker in device array is allways selected by default
        const index = localMicrophones.findIndex(device => device.value === speakerSource)
        mappedMicrophones[index].hasBeenChecked = true
        setLocalSpeakers(mappedMicrophones)
    }

    const markAsChecked = (index) => {
        const newLocalSpeakers = [...localMicrophones]
        if (newLocalSpeakers[index]) {
            newLocalSpeakers[index].hasBeenChecked = true
        }
        setLocalSpeakers(newLocalSpeakers)
    }

    const speakerNumber = () => {
        const targetIndex = localMicrophones.findIndex(device => device.value === speakerSource)
        return targetIndex
    }

    const handleCantHear = () => {
        if (!clickedNo) {
            setClickedNo(true)
        }
        const uncheckedSpeakers = [...localMicrophones].filter(device => !device.hasBeenChecked)
        if (uncheckedSpeakers.length) {
            setAudioSource(uncheckedSpeakers[0].value)
            const index = localMicrophones.findIndex(device => device.value === uncheckedSpeakers[0].value)
            markAsChecked(index)
        } else {
            setAllTested(true)
        }

    }

    return (
        <div style={{padding: "0 20px"}}>
            <Grid container spacing={2}>
                <Grid lg={12} md={12} sm={12} xs={12} item>
                    <Typography align="center" variant="h4"
                                gutterBottom><b>{allTested ? "We have tested all your Microphone" : "Do you hear a ringtone?"}</b></Typography>
                    <div className={classes.buttons}>
                        {allTested ?
                            <Button variant="outlined" onClick={handleTestAgain}>
                                Test Again
                            </Button>
                            :
                            <>
                                <Button onClick={handleComplete} variant="outlined">
                                    Yes
                                </Button>
                                <Button onClick={handleCantHear} variant="outlined">
                                    No
                                </Button>
                            </>
                        }
                    </div>
                    {clickedNo && !allTested &&
                    <Typography align="center">You have {localMicrophones.length} speakers... Now testing
                        speaker {speakerNumber() + 1} </Typography>}
                </Grid>
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
                        <Typography style={{fontWeight: '600', color: 'pink'}}>Microphone Volume
                        </Typography>
                        <p style={{fontWeight: '300', marginBottom: '15px', fontSize: '0.8em'}}>Please speak
                            into
                            the microphone to test the audio capture</p>
                        <SoundLevelDisplayer audioLevel={audioLevel} style={{margin: '20px auto'}}/>
                        <audio style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                               ref={testAudioRef} muted={playSound} autoPlay/>
                        <div style={{marginTop: '30px'}}>
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
        </div>
    );
};

export default Step4Mic;
