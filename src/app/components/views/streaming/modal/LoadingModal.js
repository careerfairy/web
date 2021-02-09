import React, {useState, useEffect, useRef} from 'react';
import { CircularProgress, Dialog, DialogContent, makeStyles } from '@material-ui/core';

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

    const [active, setActive] = useState(true)
    const [state, setState] = useState("connecting")

    const LOADING_AGORA_STATI = []

    useEffect(() => {
        if ()
    }, [status]);

    return (
        <Dialog open={active}>
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