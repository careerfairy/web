import React, {useState, useEffect, Fragment} from 'react';
import {withFirebasePage} from 'context/firebase';
import {Box, Button, ClickAwayListener, fade, Grid, makeStyles, Tab, Tabs, Typography} from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import SettingsIcon from '@material-ui/icons/Settings';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import VideoTab from "./SettingsModal/VideoTab";
import AudioTab from "./SettingsModal/AudioTab";
import { useSoundMeter } from 'components/custom-hook/useSoundMeter';

const useStyles = makeStyles((theme) => ({
    grid: {
        flexGrow: 1,
    },
    tab: {
        minWidth: '0 !important',
    },
    gridItem: {
    }
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
        {value === index && (
            <div>{children}</div>
        )}
      </div>
    );
  }

  function a11yProps(index) {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  }
  

function SettingsModal({ open, 
                        close, 
                        webRTCAdaptor, 
                        streamId, 
                        devices, 
                        localStream, 
                        audioSource,
                        setAudioSource,
                        videoSource,
                        setVideoSource,
                        speakerSource, 
                        setSpeakerSource, 
                        attachSinkId 
                    }) {

    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const [audioValue, setAudioValue] = React.useState(0);

    const audioLevel = useSoundMeter(true, localStream, audioValue);

    useEffect(() => {
        if (localStream) {
            if (devices.audioInputList && devices.audioInputList.length > 0 && (!audioSource || !devices.audioInputList.some(device => device.value === audioSource))) {
                updateAudioSource(devices.audioInputList[0].value)
            }
            if (devices.videoDeviceList && devices.videoDeviceList.length > 0 && (!videoSource || !devices.videoDeviceList.some(device => device.value === videoSource))) {
                updateVideoSource(devices.videoDeviceList[0].value)
            }
            if (devices.audioOutputList && devices.audioOutputList.length > 0 && (!speakerSource || !devices.audioOutputList.some(device => device.value === speakerSource))) {
                setSpeakerSource(devices.audioOutputList[0].value);
            }
        }   
    },[devices, localStream]);

    function updateAudioSource(deviceId) {
        webRTCAdaptor.switchAudioInputSource(streamId, deviceId)
        setAudioSource(deviceId);
        setTimeout(() => {
            setAudioValue(audioValue + 1);
        }, 500);
    }

    function updateVideoSource(deviceId) {
        webRTCAdaptor.switchVideoCameraCapture(streamId, deviceId)
        setVideoSource(deviceId);
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Dialog fullScreen={false} fullWidth maxWidth="sm" open={open} PaperProps={{ style: { minHeight: 500 }}}>
            <DialogTitle>
                <div style={{ color: 'lightgrey'}}>
                    <SettingsIcon style={{ verticalAlign: "middle", marginRight: "10px" }}/>
                    <span style={{ verticalAlign: "middle", marginRight: "10px" }}>Settings</span>
                </div>
            </DialogTitle>
            <DialogContent dividers>
                <div className={classes.grid}>
                    <Grid container spacing={3} >
                        <Grid xs={3} item>
                            <Tabs
                                orientation="vertical"
                                variant="scrollable"
                                value={value}
                                onChange={handleChange}
                                aria-label="Vertical tabs example"
                                className={classes.tabs}
                                >
                                <Tab label="Video" className={classes.tab} {...a11yProps(0)}/>
                                <Tab label="Audio" className={classes.tab} {...a11yProps(1)}/>
                            </Tabs>
                        </Grid>
                        <Grid xs={9} item className={classes.gridItem}>
                            <TabPanel value={value} index={0} className={classes.content} >
                                <VideoTab devices={devices} localStream={localStream} localStream={localStream} videoSource={videoSource} setVideoSource={updateVideoSource}/>              
                            </TabPanel>
                            <TabPanel value={value} index={1} className={classes.content}>
                                <AudioTab devices={devices} localStream={localStream} audioLevel={audioLevel} audioSource={audioSource} setAudioSource={updateAudioSource}
                                    speakerSource={speakerSource} setSpeakerSource={setSpeakerSource} attachSinkId={attachSinkId}/>
                            </TabPanel>
                        </Grid>
                    </Grid>
                </div>   
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default withFirebasePage(SettingsModal);