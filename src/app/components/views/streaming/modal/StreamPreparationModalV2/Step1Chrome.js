import React from 'react';
import {Icon} from "semantic-ui-react";
import {Box, Button, DialogContent, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const chromeLogo = "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Fchrome.svg?alt=media&token=516e705a-bafa-4a43-99f7-e184cc85b557"

const useStyles = makeStyles((theme) => ({
    svg: {
        width: 50
    },
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    }
}));
const Step1Chrome = ({handleComplete, isCompleted}) => {
    const classes = useStyles()
    return (
        <DialogContent className={classes.root}>
            <Typography variant="h5">Preparation</Typography>
            <Typography variant="subtitle1">Please follow these couple of instructions to ensure a smooth streaming
                experience:</Typography>
            <Box display="flex" flexDirection="column" alignItems="center" m={1} elevation={2}>
                <img style={{marginBottom: 10}} alt="chrome logo" className={classes.svg} src={chromeLogo}/><Typography
                align="center"><strong>PLEASE USE</strong> the latest Google
                Chrome desktop browser (v. 80 and newer).</Typography>
            </Box>
            <ul className='list'>
                <li><Icon name='video'/>Make sure that your browser is authorized to access your webcam and
                    microphone.
                </li>
                <li><Icon name='microphone'/>Make sure that your webcam and/or microphone are not currently used
                    by
                    any other application.
                </li>
                <li><Icon name='wifi'/>If possible, avoid connecting through any VPN or corporate network with
                    restrictive firewall rules.
                </li>
            </ul>
            <Button size="large" color="primary" disabled={isCompleted}
                    onClick={handleComplete}>
                <Typography variant="h5"><strong>I agree to use Google Chrome as a browser</strong></Typography>
            </Button>
        </DialogContent>
    );
};

export default Step1Chrome;
