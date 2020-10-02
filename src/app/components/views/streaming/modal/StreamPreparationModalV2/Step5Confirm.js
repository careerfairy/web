import React from 'react';
import {Dialog, DialogContent} from "@material-ui/core";
import {Button, Icon, Image} from "semantic-ui-react";

const Step5Confirm = () => {
    return (
                    <DialogContent hidden={!(streamerReady && !connectionEstablished)}
                           style={{textAlign: 'center', padding: '40px'}}>
                <div
                    style={{display: (streamerReady && !isStreaming && !errorMessage) ? 'block' : 'none'}}>
                    <Image src='/loader.gif' style={{width: '50px', height: 'auto', margin: '0 auto'}}/>
                    <div>Attempting to connect...</div>
                </div>
                <div style={{display: isStreaming ? 'block' : 'none'}}>
                    <Icon name='check circle outline'
                          style={{color: 'rgb(0, 210, 170)', fontSize: '3em', margin: '0 auto'}}/>
                    <h3>You are ready to stream!</h3>
                    <div>Your stream will go live once you press "Start Streaming".</div>
                    <Button content='Continue' style={{marginTop: '20px'}} primary
                            onClick={() => setConnectionEstablished(true)}/>
                </div>
                <div style={{display: errorMessage ? 'block' : 'none'}}>
                    <Icon name='frown outline' style={{color: 'rgb(240, 30, 0)', fontSize: '3em', margin: '0 auto'}}/>
                    <h3>An error occured with the following message:</h3>
                    <div>{errorMessage}</div>
                    <Button content='Try again' style={{margin: '20px 0'}} primary onClick={() => {
                        window.location.reload(false)
                    }}/>
                    <p>If anything is unclear or not working, please <a href='mailto:thomas@careerfairy.io'>contact
                        us</a>!</p>
                </div>
            </DialogContent>
    );
};

export default Step5Confirm;
