import React, {useState, useEffect, useContext} from 'react';

import { withFirebase } from 'context/firebase';

import { css } from 'glamor';
import ScrollToBottom from 'react-scroll-to-bottom';
import ChatEntryContainer from './chat-entry-container/ChatEntryContainer';
import { Icon, Input } from 'semantic-ui-react';
import UserContext from 'context/user/UserContext';

function MiniChatContainer(props) {

    const { authenticatedUser, userData } = useContext(UserContext);
    
    const [chatEntries, setChatEntries] = useState([]);

    const [numberOfMissedEntries, setNumberOfMissedEntries] = useState(0);
    const [numberOfLatestChanges, setNumberOfLatestChanges] = useState(0);

    const [newChatEntry, setNewChatEntry] = useState('');

    const [open, setOpen] = useState(false);

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
                    querySnapshot.docChanges().forEach( change => {
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
        if (!(newChatEntry.trim()) || (!userData && !props.livestream.test)) {
            return;
        }

        const newChatEntryObject = {
            message: newChatEntry,
            authorName: props.isStreamer || props.livestream.test ? 'Streamer' : userData.firstName + ' ' + userData.lastName.charAt(0),
            authorEmail: props.isStreamer || props.livestream.test? 'Streamer' : authenticatedUser.email,
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
        if(target.charCode==13){
            addNewChatEntry();   
        } 
    }

    const ROOT_CSS = css({
        height: open ? '160px' : '0'
    });

    let chatElements = chatEntries.map((chatEntry, index) => {
        return (
            <div key={index}>
                <ChatEntryContainer chatEntry={chatEntry}/>
            </div>       
        );
    });

    return (
        <>
            <div className='chat-container' style={{ height: open ? '250px' : '40px' }}>
                <div className='chat-container-title' onClick={() => setOpen(!open)}>
                    <Icon name='comments outline'/>Chat
                    <Icon name={ open ? 'angle down' : 'angle up'} style={{ position: 'absolute', top: '10px', right: '5px', color: 'rgb(120,120,120)'}}/>         
                    <div className='number-of-missed-entries' style={{ display: numberOfMissedEntries ? 'block' : 'none'}}>
                        <div>
                            { numberOfMissedEntries }
                        </div>
                    </div>
                </div>
                <div style={{ display: open ? 'block' : 'none' }}>
                    <ScrollToBottom className={ ROOT_CSS }>
                        { chatElements }
                    </ScrollToBottom> 
                    <div className='comment-input'>
                        <Input
                            icon={<Icon name='chevron circle right' inverted circular link onClick={() => addNewChatEntry()} color='teal'/>}
                            value={newChatEntry}
                            onChange={() => setNewChatEntry(event.target.value)}
                            onKeyPress={addNewChatEntryOnEnter}
                            maxLength='340'
                            placeholder='Post in the chat...'
                            fluid
                        />
                    </div>
                </div>             
            </div>
            <style jsx>{`
                .chat-container {
                    position: sticky;
                    bottom: 10;
                    width: 100%;
                    height: 220px;
                    background-color: rgb(245,245,245);
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                    box-shadow: 0 0 2px grey;
                }

                .comment-input {
                    margin: 5px;
                }

                .scroll-to-bottom {
                    height: 100%;
                    padding: 10px;
                }

                .chat-container-title {
                    position: relative;
                    padding: 10px 15px;
                    color: rgb(80,80,80);
                    font-weight: 600;
                    box-shadow: 0 0 2px grey;
                    z-index: 100;
                    cursor: pointer;
                    background-color: white;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                }

                .number-of-missed-entries {
                    position: absolute;
                    left: 80px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: inline-block;
                    background-color: red;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    color: white;
                }

                .number-of-missed-entries div {
                    font-size: 0.8rem;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%,-50%);
                    font-weight: 300;
                }

                .chat-container-title:hover {
                    background-color: rgb(240,240,240);
                }
          `}</style>
        </>
    );
}

export default withFirebase(MiniChatContainer);