import React, {memo, useContext} from 'react';
import Linkify from 'react-linkify';
import {makeStyles} from "@material-ui/core/styles";
import UserContext from "../../../../../../../context/user/UserContext";
import {Box, Card, Typography} from "@material-ui/core";
import Slide from "@material-ui/core/Slide";

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)

const useStyles = makeStyles((theme) => {
        const paperColor = theme.palette.background.paper;
        return {
            chatBubble: {
                borderRadius: ({isMe}) => isMe ? "23px 23px 5px 23px" : "23px 23px 23px 5px",
                maxWidth: "80%",
                width: "max-content",
                marginLeft: ({isMe}) => isMe ? "auto" : 8,
                margin: 8,
                minWidth: 140,
                padding: "10px 15px",
                paddingBottom: 5,
                backgroundColor: ({isMe, isStreamer}) => isMe ? theme.palette.primary.main : isStreamer ? "#ff1493" : paperColor,
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
                fontSize: "0.7em",
                marginBottom: 0,
                color: ({isMe, isStreamer}) => isMe || isStreamer ? "white" : "rgb(180,180,180)",
            }
        }
    })

;

function ChatEntryContainer({chatEntry}) {
    const timeAgo = chatEntry?.timestamp ? dayjs(chatEntry.timestamp.toDate()).fromNow() : ""

    const {authenticatedUser} = useContext(UserContext);
    const isMe = chatEntry?.authorEmail === authenticatedUser?.email
    const isStreamer = chatEntry?.authorEmail === "Streamer"
    const classes = useStyles({
        isMe,
        isStreamer
    })

    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank">
            {text}
        </a>
    );

    return (
        <Slide in direction={isMe ? "left" : "right"}>
            <Box component={Card} className={classes.chatBubble}>
                <Linkify componentDecorator={componentDecorator}>
                    {chatEntry.message}
                </Linkify>
                <Typography className={classes.author}>
                    {chatEntry.authorName}
                </Typography>
                <Typography align="right" className={classes.stamp}>
                    {timeAgo}
                </Typography>
            </Box>
        </Slide>
    );
}

export default memo(ChatEntryContainer);