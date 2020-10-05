import React, {useEffect, useRef} from 'react';
import SoundLevelDisplayer from "../../../common/SoundLevelDisplayer";
import {Button, DialogContent, Grid, MenuItem, Select, Typography, InputLabel, FormControl} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    actions: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 20

    }
}))

const Step2Camera = ({videoSource, devices, setVideoSource, audioSource, setAudioSource, playSound, setPlaySound, setStreamerReady, setActiveStep, localStream}) => {
    const classes = useStyles()

    const testVideoRef = useRef(null);
    useEffect(() => {
        if (localStream) {
            testVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);


    const handleChangeCam = (event) => {
        setVideoSource(event.target.value)
    }


    return (
        <div style={{padding: "0 20px"}}>
            <Typography variant="h5">Video</Typography>
            <Typography variant="subtitle1">Please select your camera for this stream:</Typography>
            <Grid container>
                <Grid item>
                    <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <video style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                               ref={testVideoRef} muted={playSound} autoPlay width={'100%'}/>
                    </div>
                    <div className={classes.actions}>
                        <FormControl  variant="outlined">
                            <InputLabel id="camera">Select Camera</InputLabel>
                            <Select value={videoSource}
                                    onChange={handleChangeCam}
                                    variant="outlined"
                                    id="camera"
                                    label="Select Camera">
                                {devices.videoDeviceList.map(device => {
                                    return (<MenuItem value={device.value}>{device.text}</MenuItem>)
                                })}
                            </Select>
                        </FormControl>
                        <Button color="primary" variant="contained" size="large"
                                onClick={() => {
                                    setActiveStep(2)
                                }}>
                            Next step
                        </Button>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default Step2Camera;
