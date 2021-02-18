import {makeStyles} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../../../../util/constants";
import React from "react";
import { Avatar, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    streamers: {
        width: ({cardHovered}) => cardHovered && "100%",
        justifyContent: ({cardHovered}) => cardHovered && "space-between",
        display: 'flex',
        textAlign: 'center',
        // overflowX: "auto",
    },
    streamer: {
        display: "flex",
        flex: 1,
        minWidth: 95,
        flexDirection: "column",
        alignItems: "center",
        padding: theme.spacing(0.5),
    },
    name: {
        marginTop: theme.spacing(1) ,
        textAlign: 'center',
        fontSize: "0.8em",
        fontWeight: "bold",
        width: "100%"

    },
    avatar: {
        width: '2em',
        height: '2em',
        // borderRadius: '50%',
    },
    streamerPosition: {
        margin: "0 0 0 0",
        fontSize: "0.8em",
        lineHeight: "1.2em",
        color: "grey",
        fontWeight: 300,
        overflowWrap: "break-word",
        wordWrap: "break-word",
        hyphens: "auto",
        width: "100%"
    },
}))
//
const Streamers = ({speakers, cardHovered}) => {

    const classes = useStyles({cardHovered})
    return (
        <div className={classes.streamers}>
            {speakers.map(speaker => {
                return (
                    <div key={speaker.id} className={classes.streamer}>
                        <Avatar
                            className={classes.avatar}
                            src={speaker.avatar || speakerPlaceholder}
                            alt={speaker.firstName}/>
                        <Typography noWrap className={classes.name}>
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