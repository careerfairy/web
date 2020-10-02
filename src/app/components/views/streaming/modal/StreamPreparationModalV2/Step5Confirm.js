import React from 'react';
import {Box, Dialog, DialogContent} from "@material-ui/core";
import {Button, Icon, Image} from "semantic-ui-react";

const Step5Confirm = ({streamerReady, isStreaming, errorMessage, setConnectionEstablished}) => {
    return (
        <DialogContent style={{textAlign: 'center', padding: '40px'}}>
            <Box hidden={!(streamerReady && !isStreaming && !errorMessage)}>
                <Image src='/loader.gif' style={{width: '50px', height: 'auto', margin: '0 auto'}}/>
                <div>Attempting to connect...</div>
            </Box>
            <div style={{display: isStreaming ? 'block' : 'none'}}>
                <Icon name='check circle outline'
                      style={{color: 'rgb(0, 210, 170)', fontSize: '3em', margin: '0 auto'}}/>
                <h3>You are ready to stream!</h3>
                <div>Your stream will go live once you press "Start Streaming".</div>
                <Button content='Continue' style={{marginTop: '20px'}} primary
                        onClick={() => setConnectionEstablished(true)}/>
            </div>
        </DialogContent>
    );
};

export default Step5Confirm;
