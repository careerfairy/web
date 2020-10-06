import React, {useState} from 'react';
import {Icon} from "semantic-ui-react";
import {Box, Button, Checkbox, DialogContent, FormControlLabel, Grid, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Link from "next/link";

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
const Step1Chrome = ({isCompleted, handleMarkComplete}) => {


    const classes = useStyles()
    return (
        <>
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
            <FormControlLabel style={{margin: "0 auto"}}
                control={<Checkbox
                    name='agreeTerm'
                    placeholder='Confirm Password'
                    onChange={handleMarkComplete}
                    value={isCompleted}
                    checked={isCompleted}
                    disabled={isCompleted}
                    color="primary"
                />}
                label={<Typography variant="h5">I will use Google Chrome as a browser</Typography>}
            />
            {/*<Button onClick={handleComplete} color="primary" variant="contained" fullWidth>*/}
            {/*    I agree to use Google Chrome as a browser*/}
            {/*</Button>*/}
        </>
    );
};

export default Step1Chrome;
