import React, {useEffect, useRef, useState} from 'react';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import {
    Button,
    Grid,
    MenuItem,
    Select,
    Typography,
    InputLabel,
    FormControl,
    FormControlLabel,
    Checkbox, DialogContent
} from "@material-ui/core";
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

}))

const Step2Camera = ({videoSource, devices, setVideoSource, playSound, handleMarkComplete, localStream, isCompleted}) => {
    const classes = useStyles()

    const testVideoRef = useRef(null);
    const inputLabel = useRef(null);
    const [labelWidth, setLabelWidth] = useState(0);

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
        <Grid container spacing={2}>
            {/*<Grid sm={12} xs={12} item>*/}
            {/*    <Typography align="center" gutterBottom variant="h4"><b>Video</b></Typography>*/}
            {/*    <Typography variant="subtitle1">Please select your camera for this stream:</Typography>*/}
            {/*</Grid>*/}
            <Grid sm={12} xs={12} item>
                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <video style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                           ref={testVideoRef} muted={playSound} autoPlay width={'100%'}/>
                </div>
            </Grid>
            <Grid item className={classes.actions} lg={12} md={12} sm={12} xs={12}>
                <FormControl disabled={!devices.videoDeviceList.length} fullWidth variant="outlined">
                    <InputLabel shrink
                                ref={inputLabel}
                                htmlFor="cameraSelect">Select Camera</InputLabel>
                    <Select value={videoSource || ""}
                            fullWidth
                            onChange={handleChangeCam}
                            variant="outlined"
                            id="cameraSelect"
                            input={
                                <OutlinedInput
                                    notched
                                    labelWidth={labelWidth}
                                    name="camera"
                                    id="cameraSelect"/>
                            }
                            label="Select Camera">
                        <MenuItem value="" disabled>
                            Choose a Camera
                        </MenuItem>
                        {devices.videoDeviceList.map(device => {
                            return (<MenuItem key={device.value} value={device.value}>{device.text}</MenuItem>)
                        })}
                    </Select>
                </FormControl>
            </Grid>
            <Grid style={{display: "flex"}} lg={12} md={12} sm={12} xs={12} item>
                <FormControlLabel style={{margin: "0 auto"}}
                                  control={<Checkbox
                                      name='agree to camera'
                                      placeholder='Confirm Password'
                                      onChange={handleMarkComplete}
                                      value={isCompleted}
                                      checked={isCompleted}
                                      disabled={isCompleted}
                                      color="primary"
                                  />}
                                  label={<Typography
                                      variant="h5">{devices.videoDeviceList.length ? `I wish to use ${getSelected()}` : "No camera detected, I wish to continue without"}
                                  </Typography>}
                />
                {/*<Button fullWidth color="primary" variant="contained" className={classes.button} size="large"*/}
                {/*         onClick={handleComplete}>*/}
                {/*    {devices.videoDeviceList.length? `I wish to use ${getSelected()}` : "No camera detected, continue without"}*/}
                {/*</Button>*/}
            </Grid>
        </Grid>
    );
};

export default Step2Camera;
