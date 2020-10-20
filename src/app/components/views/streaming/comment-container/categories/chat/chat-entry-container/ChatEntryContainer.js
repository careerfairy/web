import React, {useState, useEffect} from 'react';
import {Input, Icon, Button, Label} from "semantic-ui-react";
import Linkify from 'react-linkify';
import ChatBubble from "../ChatBubble";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    chatBubble: {
        borderRadius: "10px",
        boxShadow: "0 0 5px rgb(180,180,180)",
        margin: 8,
        padding: "10px 15px",
        backgroundColor: "rgba(255,255,255,0.90)",
        overflowWrap: "break-word",
    },
    author: {
        fontSize: "0.8em",
        color: "rgb(180,180,180)"
    }
}));

function ChatEntryContainer({chatEntry}) {
    const classes = useStyles({chatEntry})

    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank">
            {text}
        </a>
    );

    return (<div className='animated fadeInUp faster'>
            <div className={classes.chatBubble}>
                <div className='chat-entry-message'>
                    <Linkify componentDecorator={componentDecorator}>
                        {chatEntry.message}
                    </Linkify>
                    <div className={classes.author}>
                        {chatEntry.authorName}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatEntryContainer;