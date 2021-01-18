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

const VideoTab = ({videoSource, devices, setVideoSource, playSound, handleMarkComplete, handleMarkIncomplete, displayableMediaStream, isCompleted}) => {
    const classes = useStyles()

    const testVideoRef = useRef(null);
    const inputLabel = useRef(null);
    const [labelWidth, setLabelWidth] = useState(0);

    useEffect(() => {
        if (displayableMediaStream) {
            testVideoRef.current.srcObject = displayableMediaStream;

        }
    }, [displayableMediaStream]);

    React.useEffect(() => {
        setLabelWidth(inputLabel.current.offsetWidth);
    }, []);


    const handleChangeCam = (event) => {
        setVideoSource(event.target.value)
    }

    return (
        <Grid container spacing={2}>
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
                            Select Camera
                        </MenuItem>
                        {devices.videoDeviceList.map(device => {
                            return (<MenuItem key={device.value} value={device.value}>{device.text}</MenuItem>)
                        })}
                    </Select>
                </FormControl>
            </Grid>
            <Grid sm={12} xs={12} item>
                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <video style={{boxShadow: '0 0 3px rgb(200,200,200)', borderRadius: '5px'}}
                           ref={testVideoRef} muted={true} autoPlay width={'100%'}/>
                </div>
            </Grid>
        </Grid>
    );
};

export default VideoTab;
