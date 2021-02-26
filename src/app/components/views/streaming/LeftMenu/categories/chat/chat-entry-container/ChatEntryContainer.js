import PropTypes from 'prop-types'
import React, {memo, useEffect, useState, Fragment} from 'react';
import Linkify from 'react-linkify';
import {makeStyles} from "@material-ui/core/styles";
import {Box, Card, IconButton, Paper, Popover, Slide, Typography, Zoom} from "@material-ui/core";
import {getTimeFromNow} from "../../../../../../helperFunctions/HelperFunctions";
import {useAuth} from "../../../../../../../HOCs/AuthProvider";
import {withFirebase} from "../../../../../../../context/firebase";
import {useCurrentStream} from "../../../../../../../context/stream/StreamContext";
import EmojiEmotionsOutlinedIcon from '@material-ui/icons/EmojiEmotionsOutlined';
import {heartPng, laughingPng, thumbsUpPng, wowPng} from "../EmotesModal/utils";

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)


const useStyles = makeStyles((theme) => {
        const paperColor = theme.palette.background.paper;
        return {
            emotesMenuButton: {
                position: "absolute",
                top: "50%",
                right: "-30px",
                transform: "translateY(-50%)",
                opacity: 0.3
            },
            chatWrapper: {
                marginLeft: ({isMe}) => isMe ? "auto" : 0,
                marginBottom: theme.spacing(1),
                maxWidth: "80%",
                width: "min-content",
                display: "flex",
                position: "relative",
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
                // position: "absolute",
                // top: -7,
                // right: 0,
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
            },
        }
    })

;

const Emotes = ({handleCloseEmotesMenu, firebase, chatEntryId}) => {

    const classes = useStyles()
    const {currentLivestream: {id}} = useCurrentStream()
    const {userData} = useAuth()

    const handleEmote = async (emoteProp) => {
        const userEmail = userData?.userEmail || "test@careerfairy.io"
        await firebase.emoteComment(id, chatEntryId, emoteProp, userEmail)
        handleCloseEmotesMenu()
    }

    const emotes = [
        {
            onClick: () => handleEmote("laughing"),
            src: laughingPng.src,
            alt: laughingPng.alt,
            prop: "laughing"
        },
        {
            onClick: () => handleEmote("wow"),
            src: wowPng.src,
            alt: wowPng.alt,
            prop: "wow"
        },
        {
            onClick: () => handleEmote("heart"),
            src: heartPng.src,
            alt: heartPng.alt,
            prop: "heart"
        },
        {
            onClick: () => handleEmote("thumbsUp"),
            src: thumbsUpPng.src,
            alt: thumbsUpPng.alt,
            prop: "thumbsUp"
        },
    ]


    return (
        <Fragment>
            {emotes.map(({prop, src, alt}) =>
                <IconButton size="medium" key={prop}>
                    <img onClick={() => handleEmote(prop)} className={classes.emoteImg} alt={alt}
                         src={src}/>
                </IconButton>)}
        </Fragment>
    )
}
const EmotesPreview = ({chatEntry: {wow, heart, thumbsUp, laughing}, onClick}) => {

    const classes = useStyles()
    const {currentLivestream: {id}} = useCurrentStream()
    const {userData} = useAuth()
    const [emotes, setEmotes] = useState([]);

    const shouldPreview = () => Boolean(laughing?.length || wow?.length || thumbsUp?.length || heart?.length)
    const total = [...(wow ? wow : []), ...(heart ? heart : []), ...(thumbsUp ? thumbsUp : []), ...(laughing ? laughing : [])].length

    useEffect(() => {
        const newEmotes = [
            {
                src: laughingPng.src,
                alt: laughingPng.alt,
                prop: "laughing",
                data: laughing
            },
            {
                src: wowPng.src,
                alt: wowPng.alt,
                prop: "wow",
                data: wow
            },
            {
                src: heartPng.src,
                alt: heartPng.alt,
                prop: "heart",
                data: heart
            },
            {
                src: thumbsUpPng.src,
                alt: thumbsUpPng.alt,
                prop: "thumbsUp",
                data: thumbsUp
            },
        ].filter(emote => emote.data?.length)
        setEmotes(newEmotes)

    }, [wow, heart, thumbsUp, laughing])


    return (
        <Zoom unmountOnExit mountOnEnter in={shouldPreview()}>
            <Paper onClick={onClick} className={classes.emotesPreviewPaperWrapper}>
                {emotes.map(({alt, src, prop}) => <img key={prop} className={classes.previewImg} alt={alt} src={src}/>)}
                <Typography className={classes.totalText}>
                    {total}
                </Typography>
            </Paper>
        </Zoom>
    )
}

function ChatEntryContainer({chatEntry, firebase, handleSetCurrentEntry, currentEntry}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const {authenticatedUser} = useAuth();
    const [isMe, setIsMe] = useState(chatEntry?.authorEmail === authenticatedUser?.email);
    const [isStreamer, setIsStreamer] = useState(chatEntry?.authorEmail === "Streamer");

    const classes = useStyles({
        isMe,
        isStreamer,
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

    const handleOpenEmotesMenu = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleCloseEmotesMenu = () => {
        setAnchorEl(null)
    }

    const handleClickPreview = () => handleSetCurrentEntry(chatEntry)


    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank">
            {text}
        </a>
    );

    const open = Boolean(anchorEl)
    return (
        <Slide in direction={isMe ? "left" : "right"}>
            <span className={classes.chatWrapper}

            >
                <Popover
                    id="mouse-over-popover"
                    elevation={20}
                    classes={{
                        paper: classes.emotesPaperWrapper,
                    }}
                    PaperProps={{}}
                    open={open}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={handleCloseEmotesMenu}
                    // disableRestoreFocus
                >
                    <Emotes chatEntryId={chatEntry.id} firebase={firebase}
                            handleCloseEmotesMenu={handleCloseEmotesMenu}/>
                </Popover>
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
                <IconButton size="small" className={classes.emotesMenuButton} onClick={handleOpenEmotesMenu}>
                    <EmojiEmotionsOutlinedIcon/>
                </IconButton>
                <EmotesPreview onClick={handleClickPreview}
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
