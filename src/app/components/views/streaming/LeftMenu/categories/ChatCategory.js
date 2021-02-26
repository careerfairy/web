import PropTypes from 'prop-types'
import React, {useEffect, useState} from 'react';
import {withFirebase} from '../../../../../context/firebase';
import {grey} from "@material-ui/core/colors";
import {IconButton, TextField, Typography} from "@material-ui/core";
import {fade, makeStyles} from "@material-ui/core/styles";
import ChevronRightRoundedIcon from "@material-ui/icons/ChevronRightRounded";
import ForumOutlinedIcon from "@material-ui/icons/ForumOutlined";
import ChatEntryContainer from './chat/chat-entry-container/ChatEntryContainer';
import CustomScrollToBottom from "../../../../util/CustomScrollToBottom";
import {useAuth} from "../../../../../HOCs/AuthProvider";

const useStyles = makeStyles(theme => ({
    sendIcon: {
        background: "white",
        color: ({isEmpty}) => isEmpty ? "grey" : theme.palette.primary.main,
        borderRadius: "50%",
        fontSize: 15
    },
    sendBtn: {
        width: 30,
        height: 30,
        background: fade(theme.palette.primary.main, 0.5),
        "&$buttonDisabled": {
            color: grey[800]
        },
        "&:hover": {
            backgroundColor: theme.palette.primary.main,
        },
        margin: "0.5rem"
    },
    buttonDisabled: {},
    chatInput: {
        borderRadius: 10,
        "& .MuiInputBase-root": {
            paddingRight: "0 !important",
            borderRadius: 10,
        },
    },
    scrollToBottom: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        height: "calc(100vh - 118px)",
        "& div": {
            overflowX: "hidden",
        }
    },
    entriesWrapper:{
      padding: theme.spacing(1)
    },
    chatContainer:{
        height: "100vh", display: "flex", flexDirection: "column"
    },
    chatContent: {
        display: "flex",
        flexDirection: "column",
        boxShadow: theme.shadows[10],
        zIndex: 9000,
        padding: theme.spacing(1.4),
        background: theme.palette.background.paper
    },
    chatTitle:{
        display: "flex",
        width: "100%",
        justifyContent: "center",
        fontSize: "1.2em",
        fontWeight: 500,
        textAlign: "center",
        margin: "5px 0 15px 0"
    }
}))

const ChatCategory = ({isStreamer, livestream, selectedState, firebase}) => {


    const {authenticatedUser, userData} = useAuth();
    const [focused, setFocused] = useState(false);


    const [newChatEntry, setNewChatEntry] = useState('');
    const [chatEntries, setChatEntries] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const isEmpty = (!(newChatEntry.trim()) || (!userData && !livestream.test && !isStreamer))
    const classes = useStyles({isEmpty})

    useEffect(() => {
        if (livestream.id) {
            const unsubscribe = firebase.listenToChatEntries(livestream.id, 150, querySnapshot => {
                const newEntries = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
                setChatEntries(newEntries);
            });
            return () => unsubscribe();
        }
    }, [livestream.id]);

    function addNewChatEntry() {
        if (!(newChatEntry.trim()) || submitting) {
            return;
        }
        setSubmitting(true)

        const newChatEntryObject = {
            message: newChatEntry,
            authorName: isStreamer || livestream.test ? 'Streamer' : userData.firstName + ' ' + userData.lastName.charAt(0),
            authorEmail: isStreamer || livestream.test ? 'Streamer' : authenticatedUser.email,
            votes: 0
        }

        firebase.putChatEntry(livestream.id, newChatEntryObject)
            .then(() => {
                setSubmitting(false)
                setNewChatEntry('');
            }, error => {
                setSubmitting(false)
                console.log("Error: " + error);
            });
    }

    function addNewChatEntryOnEnter(target) {
        if (target.charCode == 13) {
            addNewChatEntry();
        }
    }

    const chatElements = chatEntries.map(chatEntry => <ChatEntryContainer key={chatEntry?.id} chatEntry={chatEntry}/>);

    const playIcon = (<div>
        <IconButton classes={{root: classes.sendBtn, disabled: classes.buttonDisabled}} disabled={isEmpty}
                    onClick={() => addNewChatEntry()}>
            <ChevronRightRoundedIcon className={classes.sendIcon}/>
        </IconButton>
    </div>)

    return (
        <div className={classes.chatContainer}>
            <CustomScrollToBottom scrollViewClassName={classes.entriesWrapper} className={classes.scrollToBottom} scrollItems={chatElements}/>
            <div className={classes.chatContent}>
                <div className={classes.chatTitle}>
                    <ForumOutlinedIcon color="primary" fontSize="small"/>
                    <Typography style={{marginLeft: "0.6rem"}}>
                        Main Chat
                    </Typography>
                </div>
                <div style={{margin: 5}}>
                    <TextField
                        variant="outlined"
                        fullWidth
                        autoFocus
                        onBlur={() => setFocused(false)}
                        onFocus={() => setFocused(true)}
                        className={classes.chatInput}
                        size="small"
                        onKeyPress={addNewChatEntryOnEnter}
                        value={newChatEntry}
                        onChange={() => setNewChatEntry(event.target.value)}
                        placeholder='Post in the chat...'
                        InputProps={{
                            maxLength: 340,
                            endAdornment: playIcon,
                        }}/>
                </div>
            </div>
        </div>
    );
}

ChatCategory.propTypes = {
  firebase: PropTypes.object,
  isStreamer: PropTypes.bool,
  livestream: PropTypes.object.isRequired,
  selectedState: PropTypes.string
}

export default withFirebase(ChatCategory);

