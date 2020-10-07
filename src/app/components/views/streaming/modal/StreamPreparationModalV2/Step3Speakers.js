import React, {useEffect, useState} from 'react';
import {Button, FormControl, Grid, InputLabel, MenuItem, Select, Typography} from "@material-ui/core";
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import {makeStyles} from "@material-ui/core/styles";
import {useAudio} from "../../../../custom-hook/useAudio";


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
    }
}))

const Step3Speakers = ({setSpeakerSource, speakerSource, devices, isFirefox, attachSinkId, handleMarkComplete, isCompleted, handleMarkIncomplete}) => {
    const classes = useStyles()
    const [playing, toggle, audio] = useAudio("https://www.kozco.com/tech/piano2-CoolEdit.mp3")
    const [localSpeakers, setLocalSpeakers] = useState([])
    const [clickedNo, setClickedNo] = useState(false)
    const [allTested, setAllTested] = useState(false)

    useEffect(() => {
        if (devices && devices.audioOutputList && devices.audioOutputList.length) {
            const mappedSpeakers = devices.audioOutputList.map(speaker => (
                {...speaker, hasBeenChecked: false}
            ))// first speaker in device array is allways selected by default
            mappedSpeakers[0].hasBeenChecked = true
            setLocalSpeakers(mappedSpeakers)
        }
    }, [devices])

    useEffect(() => {
        toggle()
    }, []);

    useEffect(() => {
        if (!playing) {
            toggle()
        }
    }, [playing])

    useEffect(() => {
        if (speakerSource) {
            attachSinkId(audio, speakerSource);
        }
    }, [speakerSource])

    const handleCantHear = () => {
        handleMarkIncomplete()
        if (!clickedNo) {
            setClickedNo(true)
        }
        const uncheckedSpeakers = [...localSpeakers].filter(device => !device.hasBeenChecked)
        if (uncheckedSpeakers.length) {
            setSpeakerSource(uncheckedSpeakers[0].value)
            const index = localSpeakers.findIndex(device => device.value === uncheckedSpeakers[0].value)
            if (index > -1) {
                markAsChecked(index)
            }
            attachSinkId(audio, uncheckedSpeakers[0].value);
        } else {
            setAllTested(true)
        }

    }

    const handleTestAgain = () => {
        setAllTested(false)
        const mappedSpeakers = devices.audioOutputList.map(speaker => (
            {...speaker, hasBeenChecked: false}
        ))// first speaker in device array is allways selected by default
        const index = localSpeakers.findIndex(device => device.value === speakerSource)
        if (index > -1) {
            mappedSpeakers[index].hasBeenChecked = true
        }
        setLocalSpeakers(mappedSpeakers)
    }

    const handleChangeSpeaker = async (event) => {
        const value = event.target.value
        setSpeakerSource(value)
        const targetIndex = localSpeakers.findIndex(device => device.value === value)
        markAsChecked(targetIndex)
        attachSinkId(audio, event.target.value);
    }

    const markAsChecked = (index) => {
        const newLocalSpeakers = [...localSpeakers]
        if (newLocalSpeakers[index]) {
            newLocalSpeakers[index].hasBeenChecked = true
        }
        setLocalSpeakers(newLocalSpeakers)
    }

    const getSelected = () => {
        const targetDevice = localSpeakers.find(device => device.value === speakerSource)
        return targetDevice?.text
    }

    const speakerNumber = () => {
        return localSpeakers.findIndex(device => device.value === speakerSource)
    }

    if (isFirefox) {
        return (
            <Grid container spacing={2}>
                <Grid lg={12} md={12} sm={12} xs={12} item>
                    <Typography align="center" variant="h3"
                                gutterBottom><b>Do you hear a ringtone?</b></Typography>
                    <Typography align="center" variant="subtitle1">If not please check your device sound
                        settings.</Typography>
                </Grid>
                <Grid className={classes.warning} lg={12} md={12} sm={12} xs={12} item>
                    <Typography align="center" color="error">
                        It seems that you are using the <b>Firefox</b> web browser, please
                        be aware that you may
                        encounter issues
                        using this browser
                    </Typography>
                    <Button fullWidth color="secondary" size="large"
                            variant="outlined"
                            style={{marginTop: 10}}
                            disabled={isCompleted}
                            startIcon={<ErrorOutlineIcon style={{color: "red"}}/>}
                            endIcon={<ErrorOutlineIcon style={{color: "red"}}/>}
                            onClick={handleMarkComplete}>
                        <Typography align="center" color="error">
                            <strong>
                                I am aware and I wish to continue
                            </strong>
                        </Typography>
                    </Button>
                </Grid>
            </Grid>
        )
    }

    return (
        <Grid style={{padding: "1rem 0"}} container spacing={4}>
            <Grid lg={12} md={12} sm={12} xs={12} item>
                <Typography align="center" variant="h4"
                            gutterBottom><b>{allTested ? "We have tested all your speakers" : "Do you hear a ringtone?"}</b></Typography>
                <div className={classes.buttons}>
                    {allTested ?
                        <Button variant="outlined" onClick={handleTestAgain}>
                            Test Again
                        </Button>
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
                <Typography align="center">You have {localSpeakers.length} speakers, Now testing
                    speaker {speakerNumber() + 1}... </Typography>}
            </Grid>
            {localSpeakers.length && <Grid item className={classes.actions} lg={12} md={12} sm={12} xs={12}>
                <FormControl disabled={!localSpeakers.length} fullWidth variant="outlined">
                    <InputLabel id="speakerSelect">Select Speakers</InputLabel>
                    <Select value={speakerSource}
                            fullWidth
                            disabled={!localSpeakers.length}
                            onChange={handleChangeSpeaker}
                            variant="outlined"
                            id="speakerSelect"
                            label="Select Speakers"
                    >
                        <MenuItem value="" disabled>
                            Choose a Speaker
                        </MenuItem>
                        {localSpeakers.map(device => {
                            return (<MenuItem key={device.value} value={device.value}>{device.text}</MenuItem>)
                        })}
                    </Select>
                </FormControl>
            </Grid>}
        </Grid>
    );
};

export default Step3Speakers;
