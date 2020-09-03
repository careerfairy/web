import React, {useState, useEffect} from 'react';

import { withFirebase } from 'context/firebase';

import { css } from 'glamor';
import ScrollToBottom from 'react-scroll-to-bottom';
import ChatEntryContainer from './chat-entry-container/ChatEntryContainer';

function MiniChatContainer(props) {
    
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

    const ROOT_CSS = css({
        height: '80%'
    });

    let chatElements = chatEntries.map((chatEntry, index) => {
        return (
            <div key={index}>
                <ChatEntryContainer chatEntry={chatEntry}/>
            </div>       
        );
    });

    if (props.showMenu) {
        return null;
    }

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
                    background-color: rgba(10,10,10,0.6);
                    padding: 10px;
                    border-radius: 15px;
                }

                .scroll-to-bottom {
                    height: 100%;
                    border: 2px solid red;
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