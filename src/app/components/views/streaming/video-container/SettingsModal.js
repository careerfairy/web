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
                        updateAudioSource,
                        videoSource,
                        updateVideoSource,
                        speakerSource, 
                        setSpeakerSource, 
                        attachSinkId,
                        audioLevel
                    }) {

    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const [audioValue, setAudioValue] = React.useState(0);

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