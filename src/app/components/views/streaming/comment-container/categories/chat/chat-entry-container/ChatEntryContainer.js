import React, {useState, useEffect, useContext} from 'react';
import {Input, Icon, Button, Label} from "semantic-ui-react";
import Linkify from 'react-linkify';
import ChatBubble from "../ChatBubble";
import {makeStyles} from "@material-ui/core/styles";
import UserContext from "../../../../../../../context/user/UserContext";

const useStyles = makeStyles((theme) => ({
    chatBubble: {
        borderRadius: ({isMe}) => isMe ? "23px 23px 5px 23px" : "23px 23px 23px 5px",
        width: "90%",
        boxShadow: "0 0 5px rgb(180,180,180)",
        marginLeft: ({isMe}) => isMe ? "auto": 8,
        margin: 8,
        padding: "10px 15px",
        backgroundColor: ({isMe}) => isMe ? theme.palette.primary.main : "rgba(255,255,255,0.90)",
        color: ({isMe}) => isMe ? "white" : "inherit",
        overflowWrap: "break-word",
    },
    author: {
        fontSize: "0.8em",
        color: ({isMe}) => isMe ? "white" : "rgb(180,180,180)"
    }
}));

function ChatEntryContainer({chatEntry}) {
    const {authenticatedUser, userData} = useContext(UserContext);
    const classes = useStyles({isMe: chatEntry?.authorEmail === authenticatedUser?.email})

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