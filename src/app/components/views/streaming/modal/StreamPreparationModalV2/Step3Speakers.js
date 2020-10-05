import React from 'react';
import {Button, FormControl, Grid, InputLabel, MenuItem, Select, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

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

const Step3Speakers = ({setSpeakerSource, speakerSource, setActiveStep, devices}) => {
    const classes = useStyles()

    const handleChangeSpeaker = (event) => {
        setSpeakerSource(event.target.value)
    }

    return (
        <div style={{padding: "0 20px"}}>
            <Grid container spacing={2}>
                <Grid item>
                    <Typography variant="h5">Video</Typography>
                    <Typography variant="subtitle1">Please select your speaker for this stream:</Typography>
                </Grid>
                <Grid item className={classes.actions} lg={10} md={10} sm={12} xs={12}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel id="camera">Select Speakers</InputLabel>
                        <Select value={speakerSource}
                                fullWidth
                                onChange={handleChangeSpeaker}
                                variant="outlined"
                                id="camera"
                                label="Select Speakers"
                        >
                            {devices.audioOutputList.map(device => {
                                return (<MenuItem value={device.value}>{device.text}</MenuItem>)
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid lg={2} md={2} sm={12} xs={12} item>
                    <Button fullWidth color="primary" className={classes.button} variant="contained" size="large"
                            onClick={() => {
                                setActiveStep(2)
                            }}>
                        Next step
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default Step3Speakers;
