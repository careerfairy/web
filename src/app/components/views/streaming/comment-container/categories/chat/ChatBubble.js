import React from 'react';
import {Box, Paper, Card} from "@material-ui/core";



const ChatBubble = ({chatEntry}) => {
    return (
        <Box component={Paper}>
            <div>{chatEntry.authorName}</div>
            <div>{chatEntry.message}</div>

        </Box>
    );
};

export default ChatBubble;
