import React, {useState, useEffect, useContext} from 'react';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import {withFirebase} from 'context/firebase';
import ChevronRightRoundedIcon from '@material-ui/icons/ChevronRightRounded';
import {css} from 'glamor';
import ScrollToBottom from 'react-scroll-to-bottom';
import ChatEntryContainer from './chat-entry-container/ChatEntryContainer';
import UserContext from 'context/user/UserContext';
import ExpandLessRoundedIcon from '@material-ui/icons/ExpandLessRounded';
import {
    TextField,
    AccordionDetails, Badge, Typography, Accordion, AccordionSummary, Collapse, FormHelperText, FormControl, fade,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import {makeStyles} from "@material-ui/core/styles";
import {grey} from "@material-ui/core/colors";

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
        background: "white"
    },
    header: {
        height: "41px !important",
        padding: "10px 15px",
        "& .MuiAccordionSummary-content": {
            margin: 0,
            display: "flex",
            alignItems: "center"
        },
    },
    expanded: {
        minHeight: "41px !important"
    },
    chatRoom: {
        display: "flex",
        flexDirection: "column",
        padding: 0,
        backgroundColor: "rgb(245,245,245)"
    },
    scrollToBottom: {
        display: "flex",
        flexDirection: "column",
        height: "240px"
    }
}))

function MiniChatContainer({isStreamer, livestream, firebase}) {
    const {authenticatedUser, userData} = useContext(UserContext);

    const [chatEntries, setChatEntries] = useState([]);
    const [focused, setFocused] = useState(false);

    const [numberOfMissedEntries, setNumberOfMissedEntries] = useState(0);
    const [numberOfLatestChanges, setNumberOfLatestChanges] = useState(0);

    const [newChatEntry, setNewChatEntry] = useState('');
    const [open, setOpen] = useState(false);

    const isEmpty = (!(newChatEntry.trim()) || (!userData && !livestream.test && !isStreamer))
    const classes = useStyles({isEmpty})

    useEffect(() => {
        if (livestream.id) {
            const unsubscribe = firebase.listenToChatEntries(livestream.id, querySnapshot => {
                var chatEntries = [];
                querySnapshot.forEach(doc => {
                    let entry = doc.data();
                    entry.id = doc.id;
                    chatEntries.push(entry);
                });
                setChatEntries(chatEntries);
                if (!open) {
                    let number = 0;
                    querySnapshot.docChanges().forEach(change => {
                        if (change.type === "added" && number < 99) {
                            number++;
                        }
                    })
                    setNumberOfLatestChanges(number);
                }
            });
            return () => unsubscribe();
        }
    }, [livestream.id]);

    useEffect(() => {
        if (numberOfMissedEntries + numberOfLatestChanges < 100 && !open) {
            setNumberOfMissedEntries(numberOfMissedEntries + numberOfLatestChanges);
        }
        setNumberOfLatestChanges(0);
    }, [numberOfLatestChanges])

    useEffect(() => {
        if (open) {
            setNumberOfMissedEntries(0);
        }
    }, [open])


    function addNewChatEntry() {
        if (isEmpty) {
            return;
        }

        const newChatEntryObject = {
            message: newChatEntry,
            authorName: isStreamer || livestream.test ? 'Streamer' : userData.firstName + ' ' + userData.lastName.charAt(0),
            authorEmail: isStreamer || livestream.test ? 'Streamer' : authenticatedUser.email,
            votes: 0
        }

        firebase.putChatEntry(livestream.id, newChatEntryObject)
            .then(() => {
                setNewChatEntry('');
            }, error => {
                console.log("Error: " + error);
            });
    }

    function addNewChatEntryOnEnter(target) {
        if (target.charCode == 13) {
            addNewChatEntry();
        }
    }

    let chatElements = chatEntries.map((chatEntry, index) => {
        return (
            <div key={index}>
                <ChatEntryContainer chatEntry={chatEntry}/>
            </div>
        );
    });

    const playIcon = (<div>
        <IconButton classes={{root: classes.sendBtn, disabled: classes.buttonDisabled}} disabled={isEmpty}
                    onClick={() => addNewChatEntry()}>
            <ChevronRightRoundedIcon className={classes.sendIcon}/>
        </IconButton>
    </div>)

    return (
        <Accordion TransitionProps={{unmountOnExit: true}} onChange={() => setOpen(!open)} expanded={open}>
            <AccordionSummary className={classes.header}
                              expandIcon={<ExpandLessRoundedIcon/>}
                              aria-controls="chat-header"
                              id="chat-header"
                              classes={{expanded: classes.expanded}}
                              style={{boxShadow: "0 0 2px grey"}}
            >
                <Badge badgeContent={numberOfMissedEntries} color="error">
                    <ForumOutlinedIcon fontSize="small"/>
                </Badge>
                <Typography style={{marginLeft: "0.6rem"}}>
                    Chat
                </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.chatRoom}>
                <ScrollToBottom className={classes.scrollToBottom}>
                    {chatElements}
                </ScrollToBottom>
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
                    <Collapse align="center"
                              style={{color: "grey", fontSize: "0.8em", marginTop: 3, padding: "0 0.8em"}}
                              in={focused && !isStreamer}>
                        For questions, please use the Q&A tool!
                    </Collapse>
                </div>
            </AccordionDetails>
        </Accordion>
    );
}

export default withFirebase(MiniChatContainer);