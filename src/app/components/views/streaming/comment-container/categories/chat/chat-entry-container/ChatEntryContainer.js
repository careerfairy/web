import React, {useState, useEffect, useContext} from 'react';
import Linkify from 'react-linkify';
import {makeStyles} from "@material-ui/core/styles";
import UserContext from "../../../../../../../context/user/UserContext";
import {Typography} from "@material-ui/core";

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)

const useStyles = makeStyles((theme) => ({
    chatBubble: {
        borderRadius: ({isMe}) => isMe ? "23px 23px 5px 23px" : "23px 23px 23px 5px",
        maxWidth: "80%",
        width: "max-content",
        boxShadow: "0 0 5px rgb(180,180,180)",
        marginLeft: ({isMe}) => isMe ? "auto" : 8,
        margin: 8,
        padding: "10px 15px",
        paddingBottom: 5,
        backgroundColor: ({isMe, isStreamer}) => isMe ? theme.palette.primary.main : isStreamer ? "#ff1493" : "rgba(255,255,255,0.90)",
        color: ({isMe, isStreamer}) => isMe || isStreamer ? "white" : "inherit",
        overflowWrap: "break-word",
    },
    author: {
        fontSize: "0.8em",
        color: ({isMe, isStreamer}) => isMe || isStreamer ? "white" : "rgb(180,180,180)",
        overflowWrap: "break-word",
        whiteSpace: "nowrap"
    },
    stamp: {
        fontSize: "0.8em",
        marginBottom: 0
    }
}));

function ChatEntryContainer({chatEntry}) {
    console.log("-> chatEntry", chatEntry);
    const timeAgo = chatEntry?.timestamp ? dayjs(chatEntry.timestamp.toDate()).fromNow() : ""

    const {authenticatedUser} = useContext(UserContext);
    const classes = useStyles({
        isMe: chatEntry?.authorEmail === authenticatedUser?.email,
        isStreamer: chatEntry?.authorEmail === "Streamer"
    })

    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank">
            {text}
        </a>
    );

    return (
        <div className='animated fadeInUp faster'>
            <div className={classes.chatBubble}>
                <Linkify componentDecorator={componentDecorator}>
                    {chatEntry.message}
                </Linkify>
                <Typography className={classes.author}>
                    {chatEntry.authorName}
                </Typography>
                <Typography align="right" className={classes.stamp}>
                    {timeAgo}
                </Typography>
            </div>
        </div>
    );
}

export default ChatEntryContainer;