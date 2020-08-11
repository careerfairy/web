import React, {useState, useEffect} from 'react';

import { withFirebase } from 'data/firebase';

import { css } from 'glamor';
import ScrollToBottom from 'react-scroll-to-bottom';
import ChatEntryContainer from './chat-entry-container/ChatEntryContainer';

function MiniChatContainer(props) {
    
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
            authorName: 'Streamer',
            authorEmail: 'Streamer',
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
        height: '100%',
    });

    let chatElements = chatEntries.map((chatEntry, index) => {
        return (
            <div key={index}>
                <ChatEntryContainer chatEntry={chatEntry}/>
            </div>       
        );
    });

    return (
        <div>
            <div className='chat-container'>
                <div className='chat-container-title'>Main Chat</div>
                <ScrollToBottom className={ ROOT_CSS }>
                    { chatElements }
                </ScrollToBottom>          
            </div>
            <style jsx>{`
                .chat-container {
                    width: 100%;
                    height: 220px;
                }

                .chat-container-title {
                    color: white;
                    margin: 0 0 10px 7px;
                    font-weight: 600;
                }
          `}</style>
        </div>
    );
}

export default withFirebase(MiniChatContainer);