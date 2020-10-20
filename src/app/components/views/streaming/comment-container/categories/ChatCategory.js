import React, {useState, useEffect, useContext} from 'react';

import {withFirebase} from '../../../../../context/firebase';
import ChatEntryContainer from './chat/chat-entry-container/ChatEntryContainer';
import {Input, Icon} from 'semantic-ui-react';

import {css} from 'glamor';
import ScrollToBottom from 'react-scroll-to-bottom';
import UserContext from 'context/user/UserContext';
import {AccordionDetails, Collapse, fade, TextField, Typography} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightRoundedIcon from "@material-ui/icons/ChevronRightRounded";
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
}))

function ChatCategory({isStreamer, livestream, selectedState, firebase}) {


    const {authenticatedUser, userData} = useContext(UserContext);
    const [focused, setFocused] = useState(false);


    const [newChatEntry, setNewChatEntry] = useState('');
    const [chatEntries, setChatEntries] = useState([]);

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
            });
            return () => unsubscribe();
        }
    }, [livestream.id]);

    function addNewChatEntry() {
        if (!(newChatEntry.trim())) {
            return;
        }

        // const newChatEntryObject = {
        //     message: newChatEntry,
        //     authorName: isStreamer ? 'Streamer' : userData.firstName + ' ' + userData.lastName.charAt(0),
        //     authorEmail: isStreamer ? 'Streamer' : authenticatedUser.email,
        //     votes: 0
        // }

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

    const ROOT_CSS = css({
        height: '100%',
        display: "flex",
        flexDirection: "column",
    });

    let chatElements = chatEntries.map((chatEntry, index) => {
        return (
            <div key={index}>
                <ChatEntryContainer chatEntry={chatEntry}/>
            </div>
        );
    });

    if (selectedState !== 'chat') {
        return null;
    }

    const playIcon = (<div>
        <IconButton classes={{root: classes.sendBtn, disabled: classes.buttonDisabled}} disabled={isEmpty}
                    onClick={() => addNewChatEntry()}>
            <ChevronRightRoundedIcon className={classes.sendIcon}/>
        </IconButton>
    </div>)

    return (
        <div>
            <div className='questionToggle'>
                <div className='questionToggleTitle'>
                    <Icon name='comments outline' color='teal'/> Main Chat
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
                    <Collapse align="center"
                              style={{color: "grey", fontSize: "1em", marginTop: 3, padding: "0 0.8em"}}
                              in={focused && !isStreamer}>
                        For questions, please use the Q&A tool!
                    </Collapse>
                </div>
            </div>
            <div className='chat-container'>
                <ScrollToBottom className={ROOT_CSS}>
                    {chatElements}
                </ScrollToBottom>
            </div>
            <style jsx>{`
                .questionToggle {
                    position: relative;
                    box-shadow: 0 4px 2px -2px rgb(200,200,200);
                    z-index: 9000;
                    padding: 10px;
                    background: white;
                }

                .questionToggleTitle {
                    width: 100%;
                    font-size: 1.2em;
                    font-weight: 500;
                    text-align: center;
                    margin: 5px 0 15px 0;
                }

                .hidden {
                    display: none;
                }

                .chat-container {
                    position: absolute;
                    top: 100px;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    background-color: rgb(220,220,220);
                }

                .chat-scrollable {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    overflow-y: scroll;
                    overflow-x: hidden;
                    padding: 0 0 10px 0;
                }

                ::-webkit-scrollbar {
                    width: 5px;
                }

                ::-webkit-scrollbar-thumb {
                    background-color: rgb(130,130,130);
                }
          `}</style>
        </div>
    );
}

export default withFirebase(ChatCategory);