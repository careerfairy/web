import PropTypes from 'prop-types'
import React, {memo, useEffect, useState} from 'react';
import Linkify from 'react-linkify';
import {makeStyles} from "@material-ui/core/styles";
import {Box, Card, Paper, Slide, Typography, Zoom} from "@material-ui/core";
import {getTimeFromNow} from "../../../../../../helperFunctions/HelperFunctions";
import {useAuth} from "../../../../../../../HOCs/AuthProvider";
import {withFirebase} from "../../../../../../../context/firebase";
import {useCurrentStream} from "../../../../../../../context/stream/StreamContext";

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)


const useStyles = makeStyles((theme) => {
        const paperColor = theme.palette.background.paper;
        return {
            chatWrapper: {
                marginLeft: ({isMe}) => isMe ? "auto" : 0,
                marginBottom: theme.spacing(1),
                maxWidth: "80%",
                width: "min-content",
                display: "flex",
                position: "relative"
            },
            emotesPreviewPaperWrapper: {
                cursor: "pointer",
                bottom: "-10px !important",
                display: "flex",
                alignItems: "center",
                zIndex: 1,
                padding: theme.spacing(0.1),
                position: "absolute",
                right: 0,
                overflow: "hidden",
                borderRadius: theme.spacing(2),
                "&  > *": {
                    margin: theme.spacing(0, 0.3)
                }
            },
            emotesPaperWrapper: {
                display: "flex",
                alignItems: "center",
                zIndex: 1,
                padding: theme.spacing(0.4),
                position: "absolute",
                top: -7,
                right: 0,
                overflow: "hidden",
                borderRadius: theme.spacing(2),
            },
            emoteImg: {
                marginRight: theme.spacing(0.3),
                cursor: "pointer",
                transition: theme.transitions.create("transform", {
                    duration: theme.transitions.duration.short,
                    easing: theme.transitions.easing.easeInOut
                }),
                "&:hover": {
                    transform: "scale(1.2) rotate(25deg)"
                },
                width: theme.spacing(2.5),
                height: theme.spacing(2.5)
            },
            previewImg: {
                width: theme.spacing(1.5),
                height: theme.spacing(1.5)
            },
            totalText: {
                fontSize: theme.spacing(1.3)
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
        const userEmail = userData?.userEmail || "test@careerfairy.io"
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
const EmotesPreview = ({chatEntry: {wow, heart, thumbsUp, laughing}, handleMouseLeave, onClick}) => {

    const classes = useStyles()
    const {currentLivestream: {id}} = useCurrentStream()
    const {userData} = useAuth()

    const shouldPreview = () => Boolean(laughing?.length || wow?.length || thumbsUp?.length || heart?.length)
    const total = [...(wow ? wow : []), ...(heart ? heart : []), ...(thumbsUp ? thumbsUp : []), ...(laughing ? laughing : [])].length

    return (
        <Zoom unmountOnExit mountOnEnter in={shouldPreview()}>
            <Paper onClick={onClick} onMouseEnter={handleMouseLeave} className={classes.emotesPreviewPaperWrapper}>
                {!!laughing?.length && <img className={classes.previewImg} alt="😆" src="/emojis/laughing.png"/>}
                {!!wow?.length && <img className={classes.previewImg} alt="😮" src="/emojis/wow.png"/>}
                {!!heart?.length && <img className={classes.previewImg} alt="❤" src="/emojis/heart.png"/>}
                {!!thumbsUp?.length && <img className={classes.previewImg} alt="👍" src="/emojis/thumbsUp.png"/>}
                <Typography className={classes.totalText}>
                    {total}
                </Typography>
            </Paper>
        </Zoom>
    )
}

function ChatEntryContainer({chatEntry, firebase, handleSetCurrentEntry, currentEntry}) {
    const [hovered, setHovered] = useState(false);
    const {authenticatedUser} = useAuth();
    const [isMe, setIsMe] = useState(chatEntry?.authorEmail === authenticatedUser?.email);
    const [isStreamer, setIsStreamer] = useState(chatEntry?.authorEmail === "Streamer");

    const classes = useStyles({
        isMe,
        isStreamer,
        hovered
    })

    useEffect(() => {
        setIsMe(chatEntry?.authorEmail === authenticatedUser?.email)
    }, [chatEntry?.authorEmail, authenticatedUser?.email])

    useEffect(() => {
        setIsStreamer(chatEntry?.authorEmail === "Streamer")
    }, [chatEntry?.authorEmail])

    useEffect(() => {
        if (currentEntry?.id === chatEntry?.id) {
            handleSetCurrentEntry(chatEntry)
        }
    }, [currentEntry, chatEntry])

    const handleMouseEnter = () => setHovered(true)
    const handleMouseLeave = () => setHovered(false)
    const handleClickPreview = () => handleSetCurrentEntry(chatEntry)


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
                <EmotesPreview onClick={handleClickPreview} handleMouseLeave={handleMouseLeave}
                               chatEntry={chatEntry}/>
            </span>
        </Slide>
    );
}

ChatEntryContainer.propTypes = {
  chatEntry: PropTypes.object.isRequired,
  currentEntry: PropTypes.object,
  firebase: PropTypes.object,
  handleSetCurrentEntry: PropTypes.func.isRequired
}

export default withFirebase(memo(ChatEntryContainer));
