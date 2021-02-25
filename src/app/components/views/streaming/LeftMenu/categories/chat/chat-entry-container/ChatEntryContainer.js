import React, {memo, useState} from 'react';
import Linkify from 'react-linkify';
import {makeStyles} from "@material-ui/core/styles";
import {Box, Card, Typography, Slide, Paper, Zoom, Badge} from "@material-ui/core";
import {getTimeFromNow} from "../../../../../../helperFunctions/HelperFunctions";
import {useAuth} from "../../../../../../../HOCs/AuthProvider";
import {withFirebase} from "../../../../../../../context/firebase";
import {useCurrentStream} from "../../../../../../../context/stream/StreamContext";

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)
const laughingAlt = "😆"
const wowAlt = "😮"
const heartAlt = "❤"
const thumbsUpAlt = "👍"


const useStyles = makeStyles((theme) => {
        const paperColor = theme.palette.background.paper;
        return {
            chatWrapper: {
                marginLeft: ({isMe}) => isMe ? "auto" : 8,
                margin: 8,
                maxWidth: "80%",
                width: "min-content",
                display: "flex",
                position: "relative"
            },
            emotesPaperWrapper: {
                display: "flex",
                zIndex: 1,
                padding: theme.spacing(0.4),
                position: "absolute",
                top: -15,
                right: 0,
                overflow: "hidden",
                borderRadius: theme.spacing(2),
                "& img": {
                    marginRight: theme.spacing(0.3),
                    cursor: "pointer",
                    transition: theme.transitions.create("transform", {
                        duration: theme.transitions.duration.short,
                        easing: theme.transitions.easing.easeInOut
                    }),
                    "&:hover": {
                        transform: "scale(1.2) rotate(25deg)"
                    }
                }
            },
            emoteImg: {
                width: theme.spacing(3),
                height: theme.spacing(3)
            },
            chatBubble: {
                borderRadius: ({isMe}) => isMe ? "23px 23px 5px 23px" : "23px 23px 23px 5px",

                width: "max-content",

                minWidth: 140,
                padding: "10px 15px",
                paddingBottom: 5,
                backgroundColor: ({
                                      isMe,
                                      isStreamer
                                  }) => isMe ? theme.palette.primary.main : isStreamer ? "#ff1493" : paperColor,
                // backgroundColor: ({hovered}) => hovered && "pink",
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

const Emotes = ({hovered, handleMouseLeave, firebase, chatEntryId}) => {

    const classes = useStyles()
    const {currentLivestream: {id}} = useCurrentStream()
    const {userData} = useAuth()

    const handleEmote = async (emoteProp) => {
        const userEmail = userData.userEmail || "test@careerfairy.io"
        await firebase.emoteComment(id, chatEntryId, emoteProp, userEmail)
        handleMouseLeave()
    }
    return (
        <Zoom style={{transitionDelay: hovered ? '200ms' : '0ms'}} unmountOnExit mountOnEnter in={hovered}>
            <Paper className={classes.emotesPaperWrapper}>
                <img onClick={() => handleEmote("laughing")} className={classes.emoteImg} alt="😆"
                     src="/emojis/laughing.png"/>
                <img onClick={() => handleEmote("wow")} className={classes.emoteImg} alt="😮" src="/emojis/wow.png"/>
                <img onClick={() => handleEmote("heart")} className={classes.emoteImg} alt="❤" src="/emojis/heart.png"/>
                <img onClick={() => handleEmote("thumbsUp")} className={classes.emoteImg} alt="👍"
                     src="/emojis/thumbsUp.png"/>
            </Paper>
        </Zoom>
    )
}
const EmotesPreview = ({chatEntry:{wow, heart, thumbsUp, laughing}}) => {

    const classes = useStyles()
    const {currentLivestream: {id}} = useCurrentStream()
    const {userData} = useAuth()

    const shouldPreview = () => Boolean(laughing?.length || wow?.length || thumbsUp?.length || heart?.length)
    return (
        <Zoom unmountOnExit mountOnEnter in={shouldPreview()}>
            <div>
                {laughing?.length && <img className={classes.emoteImg} alt="😆" src="/emojis/laughing.png"/>}
                {wow?.length && <img className={classes.emoteImg} alt="😮" src="/emojis/wow.png"/>}
                {heart?.length && <img className={classes.emoteImg} alt="❤" src="/emojis/heart.png"/>}
                {thumbsUp?.length && <img className={classes.emoteImg} alt="👍" src="/emojis/thumbsUp.png"/>}
            </div>
        </Zoom>
    )
}

function ChatEntryContainer({chatEntry, firebase}) {
    const [hovered, setHovered] = useState(false);
    console.log("-> chatEntry", chatEntry);
    const {authenticatedUser} = useAuth();
    const isMe = chatEntry?.authorEmail === authenticatedUser?.email
    const isStreamer = chatEntry?.authorEmail === "Streamer"
    const classes = useStyles({
        isMe,
        isStreamer,
        hovered
    })

    const handleMouseEnter = () => setHovered(true)
    const handleMouseLeave = () => setHovered(false)


    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank">
            {text}
        </a>
    );

    return (
        <Slide in direction={isMe ? "left" : "right"}>
            <span className={classes.chatWrapper} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Emotes chatEntryId={chatEntry.id} firebase={firebase} handleMouseLeave={handleMouseLeave}
                    hovered={hovered}/>
                <Box component={Card} className={classes.chatBubble}>
                    <Linkify componentDecorator={componentDecorator}>
                        {chatEntry.message}
                    </Linkify>
                    <Typography className={classes.author}>
                        {chatEntry.authorName}
                    </Typography>
                    <Typography align="right" className={classes.stamp}>
                        {getTimeFromNow(chatEntry.timestamp)}
                    </Typography>
                </Box>
                <EmotesPreview chatEntry={chatEntry}/>
            </span>
        </Slide>
    );
}

export default withFirebase(memo(ChatEntryContainer));