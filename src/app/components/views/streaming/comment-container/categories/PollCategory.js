import React, {useState, useEffect} from 'react';

import { withFirebase } from '../../../../../data/firebase';
import ChatEntryContainer from './chat/chat-entry-container/ChatEntryContainer';
import { Input, Icon, Button, Modal } from 'semantic-ui-react';
import PollCreationModal from './polls/poll-creation-modal/PollCreationModal';
import PollEntryContainer from './polls/poll-entry-container/PollEntryContainer';

function PollCategory(props) {

    if (props.selectedState !== 'polls') {
        return null;
    }
    
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

    const pollElements = pollEntries.map((poll, index) => {
        return (
            <PollEntryContainer poll={poll} livestream={props.livestream} />
        );
    });

    return (
        <div>
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
                    position: relative;
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

export default withFirebase(PollCategory);