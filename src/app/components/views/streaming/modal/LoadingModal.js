import { CircularProgress, Dialog, DialogContent, makeStyles } from '@material-ui/core';
import React, {useState, useEffect, useRef} from 'react';

const useStyles = makeStyles((theme) => ({
    container: {
        position: "relative",
        height: "20vh",
        width: 300
    },
    content: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
    },
    text: {
        marginTop: 10
    }
}));

function LoadingModal({ status }) {

    const classes = useStyles();

    const [state, setState] = useState("connecting")

    const LOADING_AGORA_STATI = []

    return (
        <Dialog open={LOADING_AGORA_STATI.includes(status)}>
            <DialogContent> 
                <div className={classes.container}>
                    <div className={classes.content}>
                        <CircularProgress />
                        <div className={classes.text}>
                            { state === "connecting" ? 'Connecting...' : 'Reconnecting...' }
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default LoadingModal;