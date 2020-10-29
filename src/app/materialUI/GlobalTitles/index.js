import {Typography, withStyles} from "@material-ui/core";


export const GreyPermanentMarker = withStyles(theme => ({
    root: {
        fontFamily: 'Permanent Marker',
        fontSize: "2.6em",
        color: "grey",
        width: "90%",
        textAlign: "center",
        fontWeight: 700,
    },
}))(Typography);

export const ThemedPermanentMarker = withStyles(theme => ({
    root: {
        fontFamily: 'Permanent Marker',
        fontSize: "2em",
        color: theme.palette.primary.main,
        width: "90%",
        textAlign: "center",
        fontWeight: 700,
    },
}))(Typography);

export const PollQuestion = withStyles(theme => ({
    root: {
        textAlign: "center",
        fontWeight: 500,
        fontSize: "2.5em",
        color: theme.palette.primary.main,
        marginBottom: "35",
        overflowWrap: "break-word"
    },
}))(Typography);