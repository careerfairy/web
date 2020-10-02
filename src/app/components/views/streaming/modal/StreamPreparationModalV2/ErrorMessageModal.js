import React from 'react';
import {Box, Dialog, DialogContent} from "@material-ui/core";
import {Button, Icon, Image} from "semantic-ui-react";

const ErrorMessageModal = ({errorMessage, streamerReady, connectionEstablished, isStreaming}) => {
    return (
        <Dialog open={(!streamerReady || !connectionEstablished) && errorMessage}>
            <DialogContent>
                <Box hidden={!(streamerReady && !isStreaming && !errorMessage)}>
                    <Image src='/loader.gif' style={{width: '50px', height: 'auto', margin: '0 auto'}}/>
                    <div>Attempting to connect...</div>
                </Box>
                <Icon name='frown outline' style={{color: 'rgb(240, 30, 0)', fontSize: '3em', margin: '0 auto'}}/>
                <h3>An error occured with the following message:</h3>
                <div>{errorMessage}</div>
                <Button content='Try again' style={{margin: '20px 0'}} primary onClick={() => {
                    window.location.reload(false)
                }}/>
                <p>If anything is unclear or not working, please <a href='mailto:thomas@careerfairy.io'>contact
                    us</a>!</p>
            </DialogContent>
        </Dialog>
    );
};

export default ErrorMessageModal;
