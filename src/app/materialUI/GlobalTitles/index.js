import {Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(theme => ({
    greyPermanentMarkerStyles: {
        fontFamily: 'Permanent Marker',
        fontSize: "2.6em",
        color: "grey",
        width: "90%",
        textAlign: "center",
        fontWeight: 700,
    },
    themedPermanentMarkerStyles: {
        fontFamily: 'Permanent Marker',
        fontSize: "2em",
        color: theme.palette.primary.main,
        width: "90%",
        textAlign: "center",
        fontWeight: 700,
    },
    pollQuestionStyles: {
        textAlign: "center",
        fontWeight: 500,
        fontSize: "2.2em",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        msWordBreak: "break-word"
    }
}))


export const GreyPermanentMarker = ({...props}) => {
    const classes = useStyles()
    return <Typography className={classes.greyPermanentMarkerStyles} {...props}/>
}

export const ThemedPermanentMarker = ({...props}) => {
    const classes = useStyles()
    return <Typography className={classes.themedPermanentMarkerStyles} {...props}/>
}

export const PollQuestion = ({...props}) => {
    const classes = useStyles()
    return <Typography className={classes.pollQuestionStyles} {...props}/>
}
