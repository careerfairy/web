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

const Step4Mic = ({audioLevel, audioSource, devices, setAudioSource, setPlaySound, localStream, speakerSource, attachSinkId, streamerReady, handleMarkIncomplete, handleMarkComplete, isCompleted}) => {
    const classes = useStyles()
    const [localMicrophones, setLocalMicrophones] = useState([])
    const [clickedNo, setClickedNo] = useState(false)
    const [allTested, setAllTested] = useState(false)

    useEffect(() => {
        if (devices && devices.audioInputList && devices.audioInputList.length) {
            const mappedMicrophones = devices.audioInputList.map(speaker => (
                {...speaker, hasBeenChecked: false}
            ))
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
        if (speakerSource && testAudioRef) {
            attachSinkId(testAudioRef.current, speakerSource)
        }
    }, [speakerSource, testAudioRef])

    useEffect(() => {
        setPlaySound(true)
        handleMarkIncomplete()
    }, [])

    const handleChangeMic = (event) => {
        setAudioSource(event.target.value)
        handleMarkIncomplete()
    }

    const handleTestAgain = () => {
        setAllTested(false)
        const mappedMicrophones = devices.audioInputList.map(speaker => (
            {...speaker, hasBeenChecked: false}
        ))// first speaker in device array is allways selected by default
        const index = localMicrophones.findIndex(device => device.value === audioSource)
        if (index > -1) {
            mappedMicrophones[index].hasBeenChecked = true
        }
        setLocalMicrophones(mappedMicrophones)
    }

    const markAsChecked = (index) => {
        const newLocalSpeakers = [...localMicrophones]
        if (newLocalSpeakers[index]) {
            newLocalSpeakers[index].hasBeenChecked = true
        }
        setLocalMicrophones(newLocalSpeakers)
    }

    const micNumber = () => {
        return localMicrophones.findIndex(device => device.value === audioSource)
    }

    const handleCantHear = () => {
        handleMarkIncomplete()
        if (!clickedNo) {
            setClickedNo(true)
        }
        const uncheckedSpeakers = [...localMicrophones].filter(device => !device.hasBeenChecked)
        if (uncheckedSpeakers.length) {
            setAudioSource(uncheckedSpeakers[0].value)
            const index = localMicrophones.findIndex(device => device.value === uncheckedSpeakers[0].value)
            if (index > -1) {
                markAsChecked(index)
            }
        } else {
            setAllTested(true)
        }

    }

    return (
        <Grid container spacing={4}>
            { !streamerReady &&
                <audio ref={testAudioRef} autoPlay/>      
            }
            {localMicrophones.length && 
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
                            Choose a Microphone
                        </MenuItem>
                        {localMicrophones.map(device => {
                            return (<MenuItem key={device.value} value={device.value}>{device.text}</MenuItem>)
                        })}
                    </Select>
                </FormControl>
                <SoundLevelDisplayer audioLevel={audioLevel}/>
            </Grid>}
            <Grid lg={12} md={12} sm={12} xs={12} style={{padding: "3rem 0"}} item>
                <Typography align="center" variant="h5"
                            gutterBottom><b>{allTested ? "We have tested all your Microphones" : "Speak and pause, do you hear a replay?"}</b></Typography>
                <div className={classes.buttons}>
                    {allTested ?
                        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        <Typography color="error" align="center" gutterBottom>Make sure your Microphone and camera are not in use by another app</Typography>
                        <Button variant="outlined" onClick={handleTestAgain}>
                            Test Again
                        </Button>
                        </div>
                        :
                        <>
                            <Button disabled={isCompleted} onClick={handleMarkComplete} variant="outlined">
                                Yes
                            </Button>
                            <Button onClick={handleCantHear} variant="outlined">
                                No
                            </Button>
                        </>
                    }
                </div>
                {clickedNo && !allTested &&
                <Typography align="center">You have {localMicrophones.length} microphones, Now testing
                    microphone {micNumber() + 1}... </Typography>}
            </Grid>

        </Grid>
    );
};


export default Step4Mic;
