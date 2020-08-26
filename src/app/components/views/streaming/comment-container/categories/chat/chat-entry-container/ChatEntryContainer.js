import React, {useState, useEffect} from 'react';
import {Input, Icon, Button, Label} from "semantic-ui-react";
import Linkify from 'react-linkify';
import { withFirebase } from 'context/firebase';


function ChatEntryContainer(props) {

    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank">
          {text}
        </a>
    );

    return (
        <div className='animated fadeInUp faster'>
            <div className='chat-entry-container'>
                <div className='chat-entry-message'>
                    <Linkify componentDecorator={componentDecorator}>
                        { props.chatEntry.message }
                    </Linkify>
                    <div className='chat-entry-author'>
                        { props.chatEntry.authorName }
                    </div>
                </div>
            </div>
            <style jsx>{`
                .chat-entry-container {
                    border-radius: 10px;
                    box-shadow: 0 0 5px rgb(180,180,180);
                    margin: 8px;
                    padding: 10px 15px;
                    background-color: rgba(255,255,255,0.80);
                }

                .chat-entry-author {
                    font-size: 0.8em;
                    color: rgb(180,180,180);
                }
            `}</style>
        </div>
    );
}

export default withFirebase(ChatEntryContainer);