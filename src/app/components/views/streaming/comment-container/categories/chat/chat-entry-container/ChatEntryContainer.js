import React, {useState, useEffect} from 'react';
import {Input, Icon, Button, Label} from "semantic-ui-react";
import Linkify from 'react-linkify';
import { withFirebase } from 'data/firebase';


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
                    border-radius: 25px;
                    box-shadow: 0 0 5px rgb(180,180,180);
                    margin: 10px 10px 0 10px;
                    padding: 20px;
                    background-color: white;
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