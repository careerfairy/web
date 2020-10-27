import React, {useState, useEffect, Fragment} from 'react';

import { withFirebase } from 'context/firebase';
import ChatEntryContainer from './chat/chat-entry-container/ChatEntryContainer';
import { Input, Icon, Button, Modal } from 'semantic-ui-react';
import PollCreationModal from './polls/poll-creation-modal/PollCreationModal';
import PollEntryContainer from './polls/poll-entry-container/PollEntryContainer';

function PollCategory(props) {
    
    const [addNewPoll, setAddNewPoll] = useState(false);
    const [pollEntries, setPollEntries] = useState([]);

    useEffect(() => {
        if (props.livestream.id) {
            const unsubscribe = props.firebase.listenToPollEntries(props.livestream.id, querySnapshot => {
                var pollEntries = [];
                querySnapshot.forEach(doc => {
                    let poll = doc.data();
                    poll.id = doc.id;                    
                    pollEntries.push(poll);
                });
                setPollEntries(pollEntries);
            });
            return () => unsubscribe();
        }
    }, [props.livestream.id]);

    const somePollIsCurrent = pollEntries.some( poll => poll.state === 'current');

    const pollElements = pollEntries.filter(poll => poll.state !== 'closed').map((poll, index) => {
        return (
            <Fragment key={index}>
                <PollEntryContainer poll={poll} streamer={props.streamer} user={props.user} userData={props.userData} livestream={props.livestream} somePollIsCurrent={somePollIsCurrent}/>
            </Fragment>
        );
    });

    return (
        <>
            <div className='questionToggle'>
                <div className='questionToggleTitle'>
                    <Icon name='chart bar outline' color='teal'/> Polls
                </div>
                <Button icon='add' content='Create Poll' onClick={() => setAddNewPoll(true)} primary/>
            </div>
            <div className='chat-container'>
                <div className='chat-scrollable'>
                    { pollElements }
                </div>
            </div>  
            <PollCreationModal livestreamId={props.livestream.id} open={addNewPoll} initialPoll={null} initialOptions={null} onClose={() => setAddNewPoll(false)}/>
            <style jsx>{`
                .questionToggle {
                    background-color: rgb(255,255,255);
                    height: 100px;
                    box-shadow: 0 4px 2px -2px rgb(200,200,200);
                    z-index: 9000;
                    padding: 10px;
                    text-align: center;
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
                    width: 100%;
                    background-color: rgb(220,220,220);
                }

                .chat-scrollable {
                    width: 100%;
                    overflow-y: auto;
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

export default withFirebase(PollCategory);