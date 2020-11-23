import React, {useState, useEffect, useContext} from 'react';
import {withFirebase} from '../../../../../context/firebase';
import {grey} from "@material-ui/core/colors";
import {css} from 'glamor';
import {Collapse, fade, TextField, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import ScrollToBottom from 'react-scroll-to-bottom';
import IconButton from "@material-ui/core/IconButton";
import ChevronRightRoundedIcon from "@material-ui/icons/ChevronRightRounded";
import ForumOutlinedIcon from "@material-ui/icons/ForumOutlined";
import ChatEntryContainer from './chat/chat-entry-container/ChatEntryContainer';
import UserContext from 'context/user/UserContext';

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
    scrollToBottom: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        height: "calc(100vh - 118px)",
        "& div": {
            overflowX: "hidden",
        }
    }
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
            const unsubscribe = firebase.listenToChatEntries(livestream.id, 50, querySnapshot => {
                var chatEntries = [];
                querySnapshot.forEach(doc => {
                    let entry = doc.data();
                    entry.id = doc.id;
                    chatEntries.unshift(entry);
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
        zIndex: 9000,
        display: "flex",
        flexDirection: "column",
    });

    let chatElements = chatEntries.map((chatEntry, index) => {
        return (
            <ChatEntryContainer key={chatEntry?.id} chatEntry={chatEntry}/>
        );
    });

    const playIcon = (<div>
        <IconButton classes={{root: classes.sendBtn, disabled: classes.buttonDisabled}} disabled={isEmpty}
                    onClick={() => addNewChatEntry()}>
            <ChevronRightRoundedIcon className={classes.sendIcon}/>
        </IconButton>
    </div>)

    return (
        <div className="chat-container">
            <ScrollToBottom className={classes.scrollToBottom}>
                {chatElements}
            </ScrollToBottom>
            <div className='questionToggle'>
                <div className='questionToggleTitle'>
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
            <style jsx>{`
                .questionToggle {
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 2px -2px rgb(200,200,200);
                    z-index: 9000;
                    padding: 10px;
                    background: white;
                }
                
                .chat-container {
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                }

                .questionToggleTitle {
                    display: flex;
                    width: 100%;
                    justify-content: center;
                    font-size: 1.2em;
                    font-weight: 500;
                    text-align: center;
                    margin: 5px 0 15px 0;
                }

                .hidden {
                    display: none;
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