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
        width: "100%",
        "& .MuiButton-root": {
            margin: "0 5px"
        }
    }
}))

const Step3Speakers = ({setSpeakerSource, speakerSource, handleComplete, devices, localStream, attachSinkId}) => {
    console.log("devices", devices);
    const classes = useStyles()
    const [playing, toggle, audio] = useAudio("https://www.kozco.com/tech/piano2-CoolEdit.mp3")
    const [localSpeakers, setLocalSpeakers] = useState([])
    console.log("localSpeakers", localSpeakers);

    const isFirefox = typeof InstallTrigger !== 'undefined';
    console.log("isFirefox", isFirefox);

    // console.log("audio", audio);
    // console.log("localStream", localStream);

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

//

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

    return (
        <div style={{padding: "0 20px"}}>
            <Grid container spacing={2}>
                <Grid lg={12} md={12} sm={12} xs={12} item>
                    <Typography align="center" variant="h4" gutterBottom><b>Do you hear a ringtone?</b></Typography>
                    <div className={classes.buttons}>
                        <Button style={{}} variant="outlined">
                            Yes
                        </Button>
                        <Button variant="outlined">
                            No
                        </Button>
                    </div>
                </Grid>
                <Grid item className={classes.actions} lg={12} md={12} sm={12} xs={12}>
                    <FormControl disabled={isFirefox} fullWidth variant="outlined">
                        <InputLabel id="speakerSelect">Select Speakers</InputLabel>
                        <Select value={speakerSource}
                                fullWidth
                                disabled={isFirefox}
                                onChange={handleChangeSpeaker}
                                variant="outlined"
                                id="speakerSelect"
                                label="Select Speakers"
                        >
                            {localSpeakers.map(device => {
                                return (<MenuItem value={device.value}>{device.text}</MenuItem>)
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid className={classes.warning} hidden={!isFirefox} lg={12} md={12} sm={12} xs={12} item>
                    <Typography align="center" color="error">
                        It seems that you are using the Firefox browser, please be aware that you may encounter issues
                        using this browser
                    </Typography>
                    <Button fullWidth color="secondary" size="large"
                            startIcon={<ErrorOutlineIcon style={{color: "red"}}/>}
                            endIcon={<ErrorOutlineIcon style={{color: "red"}}/>}
                            onClick={handleComplete}>
                        <Typography align="center" color="error">
                            <strong>
                                I am aware and I wish to continue
                            </strong>
                        </Typography>
                    </Button>
                </Grid>
                <Grid hidden={isFirefox} lg={12} md={12} sm={12} xs={12} item>
                    <Button fullWidth color="primary" className={classes.button} size="large"
                            onClick={handleComplete}>
                        I confirm that I can hear from {getSelected()}
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default Step3Speakers;
