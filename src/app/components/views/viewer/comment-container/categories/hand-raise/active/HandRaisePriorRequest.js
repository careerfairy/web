import React, {useState, useEffect, Fragment} from 'react';
import { Input, Icon, Button, Modal } from 'semantic-ui-react';

function HandRaisePriorRequest(props) {

    if (props.handRaiseState && props.handRaiseState.state !== 'unrequested') {
        return null;
    }

    return (
        <div className='animated fadeIn'>
            <div className='handraise-container'>
                <div className='central-container'>
                    <div className='animated bounce infinite slow'>
                        <Icon name='hand point up outline' size='huge' style={{ color: 'rgba(0, 210, 170)'}}/>
                    </div>
                    <h2>Raise your hand and join the stream!</h2>
                    <p>By raising your hand, you can request to join the stream with your computer's audio and video and ask your questions face-to-face.</p>
                    <Button size='large' icon='hand pointer outline' content='Raise my hand' onClick={() => props.updateHandRaiseRequest("requested")} primary/>
                </div>
            </div>  
            <style jsx>{`
                .handraise-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgb(240,240,240);
                }

                .central-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                    text-align: center;
                    width: 90%;
                    color: rgb(40,40,40);
                }

                .central-container h2 {
                    font-family: 'Permanent Marker';
                    font-size: 2.3em;
                    color: rgb(0, 210, 170);
                }

                .central-container p {
                    margin: 20px 0 30px 0;
                }
          `}</style>
        </div>
    );
}

export default HandRaisePriorRequest;