import React, {useEffect, useRef} from 'react';
import SoundLevelDisplayer from "../../../common/SoundLevelDisplayer";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import {Button, DialogContent, Grid, MenuItem, Select, Typography, InputLabel, FormControl} from "@material-ui/core";
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

const Step2Camera = ({videoSource, devices, setVideoSource, audioSource, setAudioSource, playSound, setPlaySound, setStreamerReady, handleComplete, localStream}) => {
    const classes = useStyles()

    const testVideoRef = useRef(null);
    const inputLabel = React.useRef(null);
    const [labelWidth, setLabelWidth] = React.useState(0);

    useEffect(() => {
        if (localStream) {
            testVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    React.useEffect(() => {
        setLabelWidth(inputLabel.current.offsetWidth);
    }, []);


    const handleChangeCam = (event) => {
        setVideoSource(event.target.value)
    }

    const getSelected = () => {
        const targetDevice = devices.videoDeviceList.find(device => device.value === videoSource)
        return targetDevice?.text
    }


    return (
        <div style={{padding: "0 20px"}}>
            <Grid container spacing={2}>
                <Grid item>
                    <Typography variant="h5">Video</Typography>
                    <Typography variant="subtitle1">Please select your camera for this stream:</Typography>
                </Grid>
                <Grid item>
                    <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <video style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                               ref={testVideoRef} muted={playSound} autoPlay width={'100%'}/>
                    </div>
                </Grid>
                <Grid item className={classes.actions} lg={12} md={12} sm={12} xs={12}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel shrink
                                    ref={inputLabel}
                                    htmlFor="cameraSelect">Select Camera</InputLabel>
                        <Select value={videoSource}
                                fullWidth
                                onChange={handleChangeCam}
                                variant="outlined"
                                id="cameraSelect"
                                input={
                                    <OutlinedInput
                                        notched
                                        labelWidth={labelWidth}
                                        name="camera"
                                        id="cameraSelect"
                                    />
                                }
                                label="Select Camera"
                        >
                            {devices.videoDeviceList.map(device => {
                                return (<MenuItem value={device.value}>{device.text}</MenuItem>)
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid lg={12} md={12} sm={12} xs={12} item>
                    <Button fullWidth color="primary" className={classes.button} size="large"
                            onClick={handleComplete}>
                        I wish to use {getSelected()}
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
};

export default Step2Camera;
