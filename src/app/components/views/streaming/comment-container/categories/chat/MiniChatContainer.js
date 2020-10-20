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
    AccordionDetails, Fab, Badge, Typography, Accordion, AccordionSummary,
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
        background: theme.palette.primary.main,
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
    }
}))

function MiniChatContainer(props) {
    const {authenticatedUser, userData} = useContext(UserContext);

    const [chatEntries, setChatEntries] = useState([]);

    const [numberOfMissedEntries, setNumberOfMissedEntries] = useState(0);
    const [numberOfLatestChanges, setNumberOfLatestChanges] = useState(0);

    const [newChatEntry, setNewChatEntry] = useState('');
    const [open, setOpen] = useState(false);

    const isEmpty = (!(newChatEntry.trim()) || (!userData && !props.livestream.test && !props.isStreamer))
    const classes = useStyles({isEmpty})

    useEffect(() => {
        if (props.livestream.id) {
            const unsubscribe = props.firebase.listenToChatEntries(props.livestream.id, querySnapshot => {
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
    }, [props.livestream.id]);

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

        // const newChatEntryObject = {
        //     message: newChatEntry,
        //     authorName: props.isStreamer || props.livestream.test ? 'Streamer' : userData.firstName + ' ' + userData.lastName.charAt(0),
        //     authorEmail: props.isStreamer || props.livestream.test ? 'Streamer' : authenticatedUser.email,
        //     votes: 0
        // }

        const newChatEntryObject = {
            message: newChatEntry,
            authorName: props.isStreamer ? 'Streamer' : userData.firstName + ' ' + userData.lastName.charAt(0),
            authorEmail: props.isStreamer ? 'Streamer' : authenticatedUser.email,
            votes: 0
        }

        props.firebase.putChatEntry(props.livestream.id, newChatEntryObject)
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

    const ROOT_CSS = css({
        height: "160px"
    });

    let chatElements = chatEntries.map((chatEntry, index) => {
        return (
            <div key={index}>
                <ChatEntryContainer chatEntry={chatEntry}/>
            </div>
        );
    });

    const playIcon = (<div>
        <IconButton classes={{root: classes.sendBtn, disabled: classes.buttonDisabled}} disabled={isEmpty} size="small"
                    onClick={() => addNewChatEntry()}>
            <ChevronRightRoundedIcon className={classes.sendIcon}/>
        </IconButton>
    </div>)

    return (
        <>
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
                    <ScrollToBottom className={ROOT_CSS}>
                        {chatElements}
                    </ScrollToBottom>
                    <div style={{margin: 5}}>
                        <TextField
                            variant="outlined"
                            fullWidth
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
                </AccordionDetails>
            </Accordion>
        </>
    );
}

export default withFirebase(MiniChatContainer);