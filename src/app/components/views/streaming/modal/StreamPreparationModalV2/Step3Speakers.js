import React, {useEffect} from 'react';
import {Button, FormControl, Grid, InputLabel, MenuItem, Select, Typography} from "@material-ui/core";
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
    }
}))

const Step3Speakers = ({setSpeakerSource, speakerSource, handleComplete, devices, localStream, attachSinkId}) => {
    const classes = useStyles()
    const [playing, toggle, audio] = useAudio("https://www.kozco.com/tech/piano2-CoolEdit.mp3")
    // console.log("audio", audio);
    // console.log("localStream", localStream);

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
        setSpeakerSource(event.target.value)
        attachSinkId(audio, event.target.value);
    }

    const getSelected = () => {
        const targetDevice = devices.audioOutputList.find(device => device.value === speakerSource)
        return targetDevice?.text
    }

    return (
        <div style={{padding: "0 20px"}}>
            <Grid container spacing={2}>
                <Grid item>
                    <Typography variant="h5">Speakers</Typography>
                    <Typography variant="subtitle1">Please select your speaker for this stream:</Typography>
                </Grid>
                <Grid item className={classes.actions} lg={12} md={12} sm={12} xs={12}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="speakerSelect">Select Speakers</InputLabel>
                        <Select value={speakerSource}
                                fullWidth
                                onChange={handleChangeSpeaker}
                                variant="outlined"
                                id="speakerSelect"
                                label="Select Speakers"
                        >
                            {devices.audioOutputList.map(device => {
                                return (<MenuItem value={device.value}>{device.text}</MenuItem>)
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid lg={12} md={12} sm={12} xs={12} item>
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
