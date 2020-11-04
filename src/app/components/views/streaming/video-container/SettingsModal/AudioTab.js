import React, {useEffect, useRef, useState} from 'react';
import {
    Box,
    Button,
    DialogContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from "@material-ui/core";
import HeadsetMicIcon from '@material-ui/icons/HeadsetMic';
import {Icon} from "semantic-ui-react";
import SoundLevelDisplayer from "../../../common/SoundLevelDisplayer";
import {makeStyles} from "@material-ui/core/styles";
import { useAudio } from 'components/custom-hook/useAudio';

const useStyles = makeStyles(theme => ({
    button: {
        height: "100%"
    },
    warning: {
        display: "flex",
        alignItems: "center",
        flexDirection: "column"
    },
    buttons: {
        display: "flex",
        justifyContent: "center",
        marginBottom: 5,
        width: "100%",
        "& .MuiButton-root": {
            margin: "0 5px"
        }
    },
    label: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    emphasis: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "& <": {
            margin: "0 5px"
        }
    }
}))

const AudioTab = ({audioLevel, audioSource, devices, setAudioSource, setSpeakerSource, localStream, speakerSource, attachSinkId, sinkId}) => {
    const classes = useStyles()
    const [localMicrophones, setLocalMicrophones] = useState([])
    const [playing, toggle, audio] = useAudio("https://www.kozco.com/tech/piano2-CoolEdit.mp3")


    useEffect(() => {
        if (devices && devices.audioInputList && devices.audioInputList.length) {
            const mappedMicrophones = devices.audioInputList.map(speaker => (
                {...speaker, hasBeenChecked: false}
            ))// first speaker in device array is allways selected by default
            mappedMicrophones[0].hasBeenChecked = true
            setLocalMicrophones(mappedMicrophones)
        }
    }, [devices])

    const testAudioRef = useRef(null);
    useEffect(() => {
        if (localStream) {
            testAudioRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (speakerSource) {
            attachSinkId(audio, speakerSource);
        }
    }, [speakerSource])

    useEffect(() => {
        if (speakerSource && testAudioRef) {
            attachSinkId(testAudioRef.current, speakerSource)
        }
    }, [speakerSource, testAudioRef])

    const handleChangeMic = (event) => {
        setAudioSource(event.target.value)
    }

    const handleChangeSpeaker = async (event) => {
        const value = event.target.value
        setSpeakerSource(value)
        const targetIndex = devices.audioInputList.findIndex(device => device.value === value)
        attachSinkId(audio, event.target.value);
    }

    return (
        <Grid container spacing={4}>
            <audio ref={testAudioRef} sinkIdautoPlay/>       
            {devices.audioInputList.length && 
            <Grid item lg={12} md={12} sm={12} xs={12}>
                <FormControl style={{marginBottom: 10}} disabled={!devices.audioInputList.length} fullWidth variant="outlined">
                    <InputLabel id="microphoneSelect">Select Microphone</InputLabel>
                    <Select value={audioSource}
                            fullWidth
                            onChange={handleChangeMic}
                            variant="outlined"
                            id="microphoneSelect"
                            label="Select Microphone"
                    >
                        <MenuItem value="" disabled>
                            Select a Microphone
                        </MenuItem>
                        {devices.audioInputList.map(device => {
                            return (<MenuItem key={device.value} value={device.value}>{device.text}</MenuItem>)
                        })}
                    </Select>
                </FormControl>
                <SoundLevelDisplayer audioLevel={audioLevel}/>
            </Grid>}
            {devices.audioOutputList.length && 
            <Grid item lg={12} md={12} sm={12} xs={12}>
                <FormControl disabled={!devices.audioOutputList.length} fullWidth variant="outlined">
                    <InputLabel id="speakerSelect">Select Speakers</InputLabel>
                    <Select value={speakerSource}
                            fullWidth
                            disabled={!devices.audioOutputList.length}
                            onChange={handleChangeSpeaker}
                            variant="outlined"
                            id="speakerSelect"
                            label="Select Speaker"
                    >
                        <MenuItem value="" disabled>
                            Select a Speaker
                        </MenuItem>
                        {devices.audioOutputList.map(device => {
                            return (<MenuItem key={device.value} value={device.value}>{device.text}</MenuItem>)
                        })}
                    </Select>
                </FormControl>
            </Grid>}
        </Grid>
    );
};


export default AudioTab;
