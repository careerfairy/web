import React, {useEffect, useRef, useState} from 'react';
import {Button, DialogContent, FormControl, Grid, InputLabel, MenuItem, Select, Typography} from "@material-ui/core";
import HeadsetMicIcon from '@material-ui/icons/HeadsetMic';
import {Icon} from "semantic-ui-react";
import SoundLevelDisplayer from "../../../common/SoundLevelDisplayer";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    actions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
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

const Step4Mic = ({audioLevel, audioSource, devices, setAudioSource, setPlaySound, playSound, localStream, speakerSource, attachSinkId, handleComplete}) => {
    const classes = useStyles()
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

    const micNumber = () => {
        const targetIndex = localMicrophones.findIndex(device => device.value === audioSource)
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
            <audio ref={testAudioRef} autoPlay/>
            <Grid container spacing={2}>
                <Grid lg={12} md={12} sm={12} xs={12} item>
                    <Typography align="center" variant="h4"
                                gutterBottom><b>{allTested ? "We have tested all your Microphones" : "Speak and pause, do you hear a replay?"}</b></Typography>
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
                    <Typography align="center">You have {localMicrophones.length} microphones, Now testing
                        microphone {micNumber() + 1}... </Typography>}
                </Grid>
                <Grid item className={classes.actions} lg={12} md={12} sm={12} xs={12}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="microphoneSelect">Select Microphone</InputLabel>
                        <Select value={audioSource}
                                fullWidth
                                onChange={handleChangeMic}
                                variant="outlined"
                                id="microphoneSelect"
                                label="Select Microphone"
                        >
                            {localMicrophones.map(device => {
                                return (<MenuItem key={device.value} value={device.value}>{device.text}</MenuItem>)
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid className={classes.emphasis} lg={12} md={12} sm={12} xs={12} item>
                        <HeadsetMicIcon style={{marginRight: 5}} fontSize="large" color="primary"/>
                        <Typography color="primary"><b>USE HEADPHONES!</b></Typography>
                        <HeadsetMicIcon style={{marginLeft: 5}} fontSize="large" color="primary"/>
                </Grid>
                <Grid lg={4} md={4} sm={4} xs={12} item>
                    <Typography align="center" style={{fontWeight: '600'}}>Microphone Volume:</Typography>
                </Grid>
                <Grid lg={8} md={8} sm={8} xs={12} item>
                    <SoundLevelDisplayer audioLevel={audioLevel}/>
                </Grid>
            </Grid>
        </div>
    );
};

export default Step4Mic;
