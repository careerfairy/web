import React from 'react';
import {withFirebase} from 'context/firebase';
import {makeStyles} from "@material-ui/core/styles";
import {Button, Typography} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    background: {
        width: "100%",
        height: "100vh",
        backgroundColor: theme.palette.primary.main,
        color: "white"
    },
    centered: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)"
    },
    title: {
        marginBottom: 20,
    },
    company: {
        fontWeight: "bold"
    },
    joinButton: {
        marginTop: 30
    }
}));

function PreparationOverlay ({ livestream, setStreamerReady }) {
    const classes = useStyles();

    return (
        <div className={classes.background}>
            <div className={classes.centered}>
                <Typography variant="h4" className={classes.title}>Welcome to your stream</Typography>
                <Typography variant="h2">{ livestream.title }</Typography>
                <Typography variant="h4" className={classes.company}>{ livestream.company }</Typography>
                <Button variant='contained' size='large' className={classes.joinButton} onClick={() => setStreamerReady(true) }>Join now</Button>
            </div>
        </div>
    )
}

export default withFirebase(PreparationOverlay);