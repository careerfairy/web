import React, {useEffect, useRef} from 'react';
import SoundLevelDisplayer from "../../../common/SoundLevelDisplayer";
import {Button, DialogContent, Grid, MenuItem, Select, Typography} from "@material-ui/core";

const Step2Camera = ({videoSource, devices, setVideoSource, audioSource, setAudioSource, playSound, setPlaySound, setStreamerReady, setActiveStep, localStream}) => {
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
        <div style={{padding: 20, overflow: "scroll"}}>
            <Typography variant="h5">Video</Typography>
            <Typography variant="subtitle1">Please select your camera for this stream:</Typography>
            <Grid container>
                <Grid item>
                    <Select value={videoSource}
                            onChange={handleChangeCam}
                            variant="outlined"
                            style={{marginBottom: 10}}
                    >
                        {devices.videoDeviceList.map(device => {
                            return (<MenuItem value={device.value}>{device.text}</MenuItem>)
                        })}
                    </Select>
                    <div>
                        <video style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                               ref={testVideoRef} muted={playSound} autoPlay width={'100%'}/>
                    </div>
                </Grid>

                <Button color="primary" variant="contained" style={{margin: '10px 0 10px 0'}}
                        onClick={() => {
                            setActiveStep(2)
                        }}>
                    Next step
                </Button>
            </Grid>
        </div>
    );
};

export default Step2Camera;
