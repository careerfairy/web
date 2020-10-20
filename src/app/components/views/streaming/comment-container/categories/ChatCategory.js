import React, {useState, useEffect, useContext} from 'react';

import {withFirebase} from '../../../../../context/firebase';
import ChatEntryContainer from './chat/chat-entry-container/ChatEntryContainer';
import {Input, Icon} from 'semantic-ui-react';

import {css} from 'glamor';
import ScrollToBottom from 'react-scroll-to-bottom';
import UserContext from 'context/user/UserContext';

function ChatCategory(props) {

    const {authenticatedUser, userData} = useContext(UserContext);

    const [newChatEntry, setNewChatEntry] = useState('');
    const [chatEntries, setChatEntries] = useState([]);

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
            });
            return () => unsubscribe();
        }
    }, [props.livestream.id]);

    function addNewChatEntry() {
        if (!(newChatEntry.trim())) {
            return;
        }

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

    if (props.selectedState !== 'chat') {
        return null;
    }

    return (
        <div>
            <div className='questionToggle'>
                <div className='questionToggleTitle'>
                    <Icon name='comments outline' color='teal'/> Main Chat
                </div>
                <div className='comment-input'>
                    <Input
                        icon={<Icon name='chevron circle right' inverted circular link onClick={() => addNewChatEntry()}
                                    color='teal'/>}
                        value={newChatEntry}
                        onChange={() => setNewChatEntry(event.target.value)}
                        onKeyPress={addNewChatEntryOnEnter}
                        maxLength='340'
                        placeholder='Post in the chat...'
                        fluid
                    />
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
                    height: 100px;
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