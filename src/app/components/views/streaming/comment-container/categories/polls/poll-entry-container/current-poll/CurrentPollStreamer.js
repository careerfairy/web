import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Button, Dropdown} from "semantic-ui-react";
import { withFirebase } from 'context/firebase';
import PollOptionResultViewer from './PollOptionResultViewer';


function CurrentPollStreamer(props) {

    function setPollState(state) {
        props.firebase.setPollState(props.livestream.id, props.poll.id, state);
    }

    let totalVotes = 0;
    props.poll.options.forEach( option => totalVotes += option.votes );
    
    const optionElements = props.poll.options.map((option, index) => {
        return (
            <Fragment key={index}>
                <PollOptionResultViewer option={option} index={index} totalVotes={totalVotes} />
            </Fragment>
        );
    });

    return (
        <Fragment>
            <div className='animated fadeInUp faster'>
                <div className='chat-entry-container'>
                    <div className='poll-entry-message'>
                        { props.poll.question }
                    </div>
                    { optionElements }
                </div>           
                <Button attached='bottom' content={ 'Close Poll' } primary onClick={() => setPollState('closed') } style={{ margin: '0 10px 10px 10px', border: 'none' }}/>
            </div>   
            <style jsx>{`
                .chat-entry-container {
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                    box-shadow: 0 0 5px rgb(180,180,180);
                    margin: 10px 10px 0 10px;
                    padding: 20px 20px 20px 20px;
                    background-color: white;
                    border: 10px solid rgb(0, 210, 170);
                }

                .popup {
                    position: fixed;
                    bottom: 20px;
                    left: 300px;
                    width: 400px;
                    z-index: 9000;
                    padding: 30px;
                    border-radius: 10px;
                    background-color: white;
                }

                .popup .name {
                    font-size: 1.6em;
                    margin: 10px 0 30px 0;
                    font-weight: 700;
                    color: rgb(0, 210, 170);
                }

                .poll-entry-message {
                    font-weight: 700;
                    font-size: 1.4em;
                    margin: 5px 0 25px 0;
                }

                .chat-entry-author {
                    font-size: 0.8em;
                    color: rgb(180,180,180);
                }
            `}</style>
        </Fragment>
    );    
}

export default withFirebase(CurrentPollStreamer);