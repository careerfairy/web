import {makeStyles} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../../../../util/constants";
import React from "react";
import {Avatar} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
    streamers: {
        width: ({cardHovered}) => cardHovered && "100%",
        justifyContent: ({cardHovered}) => cardHovered && "space-between",
        display: 'flex',
        textAlign: 'center',
    },
    streamer: {
        display: "flex",
        flex: 1,
        minWidth: 120,
        flexDirection: "column",
        alignItems: "center",
        padding: theme.spacing(1)
    },
    name: {
        margin: '0.75em 0',
        textAlign: 'center'
    },
    avatar: {
        width: '2em',
        height: '2em',
        borderRadius: '50%',
        zIndex: 1
    },
    streamerPosition: {
        margin: "0 0 0 0",
        fontSize: "0.9em",
        lineHeight: "1.2em",
        color: "grey",
        fontWeight: 300,
        overflowWrap: "break-word",
        wordWrap: "break-word",
        hyphens: "auto",
    },
}))

const Streamers = ({speakers, cardHovered}) => {

    const classes = useStyles({cardHovered})
    return (
        <div className={classes.streamers}>
            {speakers.map(speaker => {
                return (
                    <div className={classes.streamer}>
                        <Avatar
                            className={classes.avatar}
                            src={speaker.avatar || speakerPlaceholder}
                            alt={speaker.firstName}/>
                        <Typography className={classes.name}>
                            {`${speaker.firstName} ${speaker.lastName}`}
                        </Typography>
                        <Typography className={classes.streamerPosition}>
                            {speaker.position}
                        </Typography>
                    </div>
                )
            })}
        </div>

    )
}

export default Streamers