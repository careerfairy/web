import React, {useEffect, useState} from 'react';
import {Box, Dialog, DialogContent, Grid, TextField} from "@material-ui/core";
import {Button, Icon, Image} from "semantic-ui-react";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 20px"
    }
}))


const Step5Confirm = ({streamerReady, isStreaming, errorMessage, setConnectionEstablished, audioSource, videoSource, devices, speakerSource}) => {
    const classes = useStyles()
    const [labels, setLabels] = useState({
        speaker: "",
        microphone: "",
        camera: ""
    })
    console.log("labels", labels);

    const setLabelObj = (value, deviceList) => {
        const targetIndex = deviceList.findIndex(device => device.value === value)
        let label = ""
        if (deviceList[targetIndex]) {
            label = deviceList[targetIndex].text
        }
        return label
    }

    useEffect(() => {
        let labelsObj = {...labels}
        if (audioSource && devices && devices.audioInputList && devices.audioInputList.length) {
            labelsObj.microphone = setLabelObj(audioSource, devices.audioInputList)

        }
        if (speakerSource && devices && devices.audioOutputList && devices.audioOutputList.length) {
            labelsObj.speaker = setLabelObj(speakerSource, devices.audioOutputList)
        }
        if (videoSource && devices && devices.videoDeviceList && devices.videoDeviceList.length) {
            labelsObj.camera = setLabelObj(videoSource, devices.videoDeviceList)
        }
        setLabels(labelsObj)
    }, [audioSource, videoSource, devices, speakerSource]);

    return (
        <div className={classes.root}>
            <Icon name='check circle outline'
                  style={{color: 'rgb(0, 210, 170)', fontSize: '3em', margin: '0 auto'}}/>
            <h3>You are ready to stream!</h3>
            <div>Your stream will go live once you press "Start Streaming".</div>
            <Grid style={{marginTop: 10}} spacing={2} container>
                <Grid sm={12} xs={12} lg={12} xl={12} hidden={!labels.camera.length} item>
                    <TextField id="camera"
                               label="Camera"
                               fullWidth
                               InputProps={{readOnly: true}}
                               value={labels.camera}
                               variant="outlined"/>
                </Grid>
                <Grid sm={12} xs={12} lg={12} xl={12} hidden={!labels.microphone.length} item>
                    <TextField id="microphone"
                               label="Microphone"
                               fullWidth
                               InputProps={{readOnly: true}}
                               value={labels.microphone}
                               variant="outlined"/>
                </Grid>
                <Grid sm={12} xs={12} lg={12} xl={12} hidden={!labels.speaker.length} item>
                    <TextField id="speaker"
                               label="Speaker"
                               fullWidth
                               InputProps={{readOnly: true}}
                               value={labels.speaker}
                               variant="outlined"/>
                </Grid>
            </Grid>
        </div>
    );
};

export default Step5Confirm;
