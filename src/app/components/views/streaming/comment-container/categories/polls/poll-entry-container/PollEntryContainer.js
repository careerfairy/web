import React, {useState, useEffect, Fragment} from 'react';
import {Input, Icon, Button, Dropdown} from "semantic-ui-react";
import Linkify from 'react-linkify';
import { withFirebase } from 'data/firebase';
import PollCreationModal from '../poll-creation-modal/PollCreationModal';


function PollEntryContainer(props) {

    const [editPoll, setEditPoll] = useState(false);

    function deletePoll() {
        props.firebase.deleteLivestreamPoll(props.livestream.id, props.poll.id);
    }

    const colors = ['#F44336', '#FF9800', '#00BCD4', '#CDDC39'];
    const optionElements = props.poll.options.map((option, index) => {
        return (
            <Fragment>
                <div className='option-container'>
                    <div className='option-container-index' style={{ backgroundColor: colors[index] }}>
                        <div>{ index + 1 }</div>       
                    </div>
                    <div className='option-container-name'>
                        { option.name }
                    </div>
                </div>
                <style jsx>{`
                    .option-container {
                        margin: 10px 0;
                    }

                    .option-container div {
                        display: inline-block;
                        vertical-align: middle;
                    }

                    .option-container-index {
                        position: relative;
                        margin: 0 5px 0 0;
                        padding: 3px;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        font-size: 0.8em;
                    }

                    .option-container-index div {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: white;
                    }

                    .option-container-name {
                        margin: 0 0 0 5px;
                    }
                `}</style>
            </Fragment>
        );
    });

    return (
        <div className='animated fadeInUp faster'>
            <div className='chat-entry-container'>
                <div className='poll-entry-message'>
                    { props.poll.question }
                </div>
                { optionElements }
                <Dropdown icon={{ name: 'ellipsis vertical', fontSize: '1.1em', color: 'grey' }} direction='left' style={{ position: 'absolute', top: '15px', right: '20px', color: 'rgb(200,200,200)'}}>
                    <Dropdown.Menu>
                        <Dropdown.Item
                            icon='edit'
                            text='Edit'
                            onClick={() => setEditPoll(true)}
                        />
                        <Dropdown.Item
                            icon='delete'
                            text='Delete'
                            onClick={() => deletePoll()}
                        />
                    </Dropdown.Menu>
                </Dropdown>
                <PollCreationModal livestreamId={props.livestream.id}  initialPoll={props.poll} open={editPoll} onClose={() => setEditPoll(false)}/>
            </div>                
            <Button attached='bottom' content={ 'Ask the Audience Now' } primary onClick={() => {}} style={{ margin: '0 10px 10px 10px', border: 'none' }} />
            <style jsx>{`
                .chat-entry-container {
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                    box-shadow: 0 0 5px rgb(180,180,180);
                    margin: 10px 10px 0 10px;
                    padding: 40px 20px 20px 20px;
                    background-color: white;
                }

                .poll-entry-message {
                    font-weight: 700;
                    font-size: 1.4em;
                    margin: 10px 0 25px 0;
                }

                .chat-entry-author {
                    font-size: 0.8em;
                    color: rgb(180,180,180);
                }
            `}</style>
        </div>
    );
}

export default withFirebase(PollEntryContainer);