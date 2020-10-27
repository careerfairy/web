import React from 'react';
import {Button} from "@material-ui/core";
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';

function HandRaiseRequested(props) {

    if (!props.handRaiseState || props.handRaiseState.state !== 'requested') {
        return null;
    }

    return (
        <>
            <div className='handraise-container'>
                <div className='central-container'>
                    <h2 className='animated flash infinite slower'>You raised your&nbsp;hand!</h2>
                    <p>Please wait to be invited to join by the&nbsp;speaker.</p>
                    <Button size='large' startIcon={<ClearRoundedIcon/>} variant="contained" children='Cancel' onClick={() => props.updateHandRaiseRequest("unrequested")} />
                </div>
            </div>  
            <style jsx>{`
                .handraise-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    background-color: rgb(240,240,240);
                }

                .central-container {
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
        </>
    );
}

export default HandRaiseRequested;