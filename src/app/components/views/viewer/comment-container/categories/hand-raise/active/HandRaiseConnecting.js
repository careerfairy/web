import React, {useState, useEffect, Fragment} from 'react';
import { Input, Icon, Button, Modal } from 'semantic-ui-react';

function HandRaiseRequested(props) {

    if (!props.handRaiseState || (props.handRaiseState.state !== 'connecting'&& props.handRaiseState.state !== 'invited')) {
        return null;
    }

    return (
        <div className='animated fadeIn'>
            <div className='handraise-container'>
                <div className='central-container'>
                    <h2>Connecting to the stream...</h2>
                    <Button size='large' icon='delete' content='Cancel' onClick={() => props.updateHandRaiseRequest("unrequested")} />
                </div>
            </div>  
            <style jsx>{`
                .questionToggle {
                    position: relative;
                    height: 100px;
                    box-shadow: 0 4px 2px -2px rgb(200,200,200);
                    z-index: 9000;
                    padding: 10px;
                    text-align: center;
                }

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

                .questionToggleTitle {
                    width: 100%;
                    font-size: 1.2em;
                    font-weight: 500;
                    text-align: center;
                    margin: 5px 0 15px 0;
                }

                .hidden {
                    display: none;
                }

                .chat-container {
                    position: absolute;
                    top: 100px;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    background-color: rgb(220,220,220);
                }

                .chat-scrollable {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    overflow-y: scroll;
                    overflow-x: hidden;
                    padding: 0 0 10px 0;
                }

                .modal-title {
                    font-size: 1.8em;
                    text-align: center;
                    font-weight: 500;
                    color: rgb(80,80,80);
                    margin: 0 0 20px 0;
                }

                .modal-content {
                    width: 60%;
                    margin: 0 auto;
                    padding: 0 0 20px 0;
                }

                .modal-content-question {
                    margin: 20px 0;
                }

                .modal-content-options {
                    margin: 10px 0 20px 0;
                }

                .modal-content-option {
                    margin: 5px 0 10px 0;
                }

                .modal-content .label {
                    font-weight: 700;
                    margin-bottom: 3px;
                    color: rgb(80,80,80);
                }

                .modal-content .label.teal {
                    font-size: 1.3em;
                    color: rgb(0, 210, 170);
                    margin-bottom: 5px;
                }

                ::-webkit-scrollbar {
                    width: 5px;
                }

                ::-webkit-scrollbar-thumb {
                    background-color: rgb(130,130,130);
                }
          `}</style>
        </div>
    );
}

export default HandRaiseRequested;